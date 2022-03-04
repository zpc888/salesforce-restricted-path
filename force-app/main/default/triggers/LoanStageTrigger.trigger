trigger LoanStageTrigger on Loan_2__c (before insert, before update) {
    for (Loan_2__c newLoan : Trigger.new) {
        newLoan.Hidden_Stage__c = newLoan.Stage__c;
    }
}