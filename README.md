# Restricted Path Lightning Web Component

Salesforce does provide a path component showing nice chevron from a picklist field. However it cannot restrict certain routing paths for each stop,
this customised lwc path componet provides this feature. By default, it works the same as built-in one, however it can define navigation rules. There are 2 ways to define routing rules:

* via trigger and field dependencies
  * adding an extra hidden field, which is a picklist and has the same values as path-picklist field (better to use global picklist values)
  * define the field dependencies between the new hidden field and path-picklist field
  * create a new trigger on "before insert, before update", for each record, let hidden-field-value = path-picklist-field-value
* via navigation rule property
  * a={b, c}, b=!{a, d}, c={c}
  * The above routing rule says a can route to b or c; b cannot route to a and d; c can only point to itself; the rest node can go anywhere
* via trigger and field dependencies + via navigation rule property
  * trigger and field dependencies are the essential
  * when both trigger + navigation rule property are defined, it should be more restricted than trigger. Because via navigation rule property to 
    to loose restriction, it may give exception at the time of saving to sObject

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)

## SFDX basic commands
```shell

sfdx force:auth:web:login --setalias prot01 --setdefaultusername

sfdx force:auth:web:login -d -a zpc-04
-a, --setalias=setailas         set an alias for the authenticated org
-d, --setdefaultdevhubusername  set the authenticated org as the default dev hub org for scratch org creation
-i, --clientid=clientid         OAuth Client ID (Sometimes called the consumer key)
-r, --instanceurl=instanceurl   the login URL of the instance the org lives on
-s, --setdefaultusername        set the authenticated org as the default username that all commands run against
--json
--loglevel=(trace|debug|info|warn|error|fatal)

sfdx force:org:create -f config/project-scratch-def.json -s -a custom-path
-a, --setalias=setalias
-c, --noancestors
-d, --durationdays=durationdays
-f, --definitionfile=definitionfile
-i, --clientid=clientid
-n, --nonamespace
-s, --setdefaultusername
-t, --type=(scratch|sandbox)
-u, --targetusername=targetusername
-v, --targetdevhubusername=targetdevhubusername
-w, --wait=wait
--apiversion=apiversion
--json
--loglevel=(trace|debug|info|warn|error|fatal)

sfdx force:org:list --all

sfdx force:org:open

sfdx force:project:create -n|--projectname MyProject --manifest --template empty|standard
-d, --outputdir=outputdir
-n, --projectname=projectname
-p, --defaultpackagedir=defaultpackagedir
-s, --namespace=namespace
-t, --template=standard|empty|analytics
-x, --manifest
--json
--loglevel=(trace|debug|info|warn|error|fatal)

sfdx force:lightning:component:create -n restrictedPath -d force-app/main/default/lwc --type lwc

```
