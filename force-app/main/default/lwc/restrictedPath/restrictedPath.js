import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

/**
 * Goal: Salesforce lightning path component provides chevron navigation experience, but it can only either be
 *       completely readonly or be fully navigable from current path without any restriction. Most applications need to
 *       restrict the navigation paths from current path.
 *       This custom path component will provide optional restricted navigable paths based on dependent-field. The
 *       drawbacks of this approach are:
 *       1) it needs an extra custom picklist field, whose values are the exactly same as path-picklist field (can use
 *       global picklist value), and it should be hidden in UI;
 *       2) the new hidden picklist should have default value because it is used as control field for path-picklist one;
 *       otherwise when creating a record, path-picklist has no valid dropdown options to start with;
 *       3) a new trigger on the record should be created on both 'before insert' and 'before update', the new hidden
 *       picklist field value should equal path-picklist value. i.e.
 *
 *       trigger StudentGradeTrigger on Student__c (Before Insert, Before Update) {
 *           for (Student__c newS : Trigger.new) {
 *               newS.Hidden_Grade__c = newS.Grade__c;
 *           }
 *       }
 *
 * Author: PengCheng.Zhou@gmail.com
 */
export default class CustomPath extends LightningElement {
    @api objectApiName;
    @api recordId;
    @api recordTypeId;                  // master record type   012000000000000AAA

    @api picklistPathFieldApiName;      // must be a picklist field and case-sensitive here
    @api hideButton;                    // whether to hide the button or just to disable the button

    @api pathChangeButtonLabel;

    @api navigationRule;

    @track currentPath;
    @track allPaths = [];

    @track pathNotClickable = true;

    selectedPathIndex = -1;

    @wire(getRecord, {recordId: '$recordId', fields: '$objectQualifiedPathFieldApiNames'})
    fetchCurrentPath({ error, data }) {
        if (data) {
            this.currentPath = data.fields[this.picklistPathFieldApiName].value;
        } else if (error) {
            console.log('fail to obtain current path with Id = ', this.recordId);
            console.log(error);
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: '$objectQualifiedPathFieldApiName'
    })
    fetchAllPaths({ error, data }) {
        if (data) {
            this.allPaths = this.parseAllPathsData(data);
        } else if (error) {
            console.log('fail to obtain picklist values with fieldApiName = ', this.objectQualifiedPathFieldApiName,
                " on record-type-id = ", this.recordTypeId);
            console.log(error);
        }
    }

    get currentPathIndex() {
        let idx = 0;
        if (this.allPaths && this.currentPath) {
            for (let i = 0; i < this.allPaths.length; i++) {
                if (this.allPaths[i].value === this.currentPath) {
                    idx = i;
                    break;
                }
            }
        }
        return idx;
    }

    renderedCallback() {
        if (this.hideButton) {
            this.toggleChangePathButton(this.pathNotClickable);
        }
    }

    handlePathSelected(event) {
        this.selectedPathIndex = event.detail.index;
        const cpi = this.currentPathIndex;
        this.pathNotClickable = ( cpi == this.selectedPathIndex ||
            (this.allPaths[cpi].allowTo.length > 0 && (!this.allPaths[cpi].allowTo.includes(this.selectedPathIndex)) )
        );
        if (this.hideButton) {
            this.toggleChangePathButton(this.pathNotClickable);
        }
    }

    toggleChangePathButton(toHide) {
        this.template.querySelector("lightning-button").style = toHide ? "display: none" : "display: block";
    }

    handleSavePath() {
        const fields = {};
        fields['Id'] = this.recordId;
        fields[this.picklistPathFieldApiName] = this.allPaths[this.selectedPathIndex].value;
        updateRecord({ fields })
            .then(() => {
                this.pathNotClickable = true;
                if (this.hideButton) {
                    this.toggleChangePathButton(this.pathNotClickable);
                }
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: this.allPaths[this.selectedPathIndex].label + ' Completed',
                    variant: 'success',
                }));
            }).catch((error) => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error updating record, try again...',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }

    get objectQualifiedPathFieldApiName() {
        return this.objectApiName + '.' + this.picklistPathFieldApiName;
    }

    get objectQualifiedPathFieldApiNames() {
        return [ this.objectQualifiedPathFieldApiName ];
    }

    parseAllPathsData(data) {
        const ret = [];
        const controlToMeMap = [];
        const val2idx = {};
        for (let myIdx = 0; myIdx < data.values.length; myIdx++) {
            const item = data.values[myIdx];
            if (item.validFor) {
                for (const ctrIdx of item.validFor) {
                    controlToMeMap[ctrIdx] = ( controlToMeMap[ctrIdx] || [] );
                    controlToMeMap[ctrIdx].push(myIdx);
                }
            }
            ret.push( {
                "label": item.label,
                "value": item.value,
                "allowTo": []
            })
            val2idx[item.value] = ret.length - 1;
        }
        for (let ctrIdx = 0; ctrIdx < controlToMeMap.length; ctrIdx ++) {
            // control field and me have the same indexes, labels and values
            const allowedPathIndex = controlToMeMap[ctrIdx];
            if (allowedPathIndex && allowedPathIndex.length > 0) {
                ret[ctrIdx].allowTo = allowedPathIndex;
            }
        }
        this.mergeWithNavigationRule(val2idx, ret);
        return ret;
    }

    resolvePicklistIndexFromValue(value2Index, value) {
        const ret = value2Index[value];
        if (ret === undefined) {
            throw new Error("'" + value + "' is not in {" + Object.keys(value2Index) + "}");
        }
        return ret;
    }

    mergeWithNavigationRule(value2Index, paths) {
        if (this.navigationRule && this.navigationRule.length > 0) {
            // a={b, c}, b=!{a, d} where a, b are the values of picklist.
            // This rule says: a can go to b or c; b cannot go to a and d, the rest can go anywhere
            const fromToList = this.parseNaviRule(this.navigationRule);
            for (let i = 0; i < fromToList.length; i += 2) {
                const from = fromToList[i];
                const toList = fromToList[i + 1];
                const fromIdx = this.resolvePicklistIndexFromValue(value2Index, from[0]);   // either 1 or 2 elements, if 2 means !=negative
                const toListIdx = toList.map(v => this.resolvePicklistIndexFromValue(value2Index, v));
                let toAddList = [];
                let toRemoveList = [];
                if (from.length == 2 && from[1] === '!') {
                    // negative
                    for (let j = 0; j < paths.length; j++) {
                        if (!toListIdx.includes(j)) {
                            toAddList.push(j);
                        }
                    }
                    toAddList.push(fromIdx);
                    toRemoveList = toListIdx;
                } else {
                    // positive
                    toAddList = [...toListIdx, fromIdx];
                }
                const myPath = paths[fromIdx];
                myPath.allowTo = myPath.allowTo || [];
                if (myPath.allowTo.length == 0) {
                    // Otherwise, no point to add because field dependencies will give error at saving time
                    for (const idx of toAddList) {
                        if (!myPath.allowTo.includes(idx)) {
                            myPath.allowTo.push(idx);
                        }
                    }
                } else {
                    for (const idx of toRemoveList) {
                        const pos = myPath.allowTo.indexOf(idx);
                        if (pos !== -1) {
                            myPath.allowTo.splice(pos, 1);
                        }
                    }
                }
           }
        }
    }

    parseNaviRule( ruleStr ) {
        const ret = [];
        const rules = ruleStr.split('}').filter(s => s.length > 0).map(s => s.trim());
        for (const r of rules) {
            let [from, toList] = r.split('{').filter(s => s.length > 0).map(s => s.trim());
            from = from.split(',').filter(s => s.length > 0).map(s => s.trim())[0];
            from = from.split(';').filter(s => s.length > 0).map(s => s.trim())[0];
            from = from.split('=').filter(s => s.length > 0).map(s => s.trim());
            toList = toList.split(',').filter(s => s.length > 0).map(s => s.trim());
            //	console.log('\tfrom = ', from, '\t\ttoList = ', toList);
            ret.push( from, toList );
        }
        // console.log( ret );
        return ret;
    }

    /*
    parseNaviRule( 'a={b, c}, b=!{a, d}, c={d}' );

    from =  [ 'a' ] 		toList =  [ 'b', 'c' ]
    from =  [ 'b', '!' ] 	toList =  [ 'a', 'd' ]
    from =  [ 'c' ] 		toList =  [ 'd' ]
    [ [ 'a' ], [ 'b', 'c' ], [ 'b', '!' ], [ 'a', 'd' ], [ 'c' ], [ 'd' ] ]
     */

}