
let loopback = require('loopback');
module.exports = function (Transaction) {

    Transaction.makePayment = async function (paymentMsg) {
        let tranId = "1";
        console.dir(paymentMsg, { depth: null, colors: true });
        /* 
           Payment message has 
           1) paymentMsg.creditorAccount
           2) paymentMsg.debitAccount 
           3) paymentMsg.amount 
           Currency of transaction is same - same as currency of creditAcct
           Steps 
           1) Validate creditAcct 
           2) Validate debitAcct 
           3) check balance of debitAcct 
           4) Create transaction
           4) reduce the balance of debitAcct
           5) increase the balance of creditAcct
        */
        /* Step1 - validate creditAcct */
        let result = await validateAccount(paymentMsg.creditoraccount);
        switch (result) {
            case "VALID_ACCT":
                /* Step 2 - validate debitor account */
                let debtorStatus = await validateAccountAndBalance(paymentMsg.debitoraccount,
                    paymentMsg.tranamount);
                switch (debtorStatus) {
                    case "VALID_ACCT":
                        let response = await doTransaction(paymentMsg);
                        return (response);
                        break;
                    case "INSUFFICIENT_BAL":
                    case "NO_SUCH_ACCT":
                    case "NOT_A_UNIQ_ACCT":
                        return(debtorStatus);
                        break;

                }
                break;
            case "NO_SUCH_ACCT":
            case "NOT_A_UNIQ_ACCT":
                return(result);
                break;

        }

    }

    function validateAccount(account) {
        return new Promise(function (resolve, reject) {
            let accountModel = loopback.findModel("Account");
            let whereClause = { where: { accountid: account } };
            accountModel.find(whereClause, function (err, res) {
                if (res.length <= 0) {
                    resolve("NO_SUCH_ACCT");
                }
                else if (res.length === 1) {
                    resolve("VALID_ACCT");
                }
                else {
                    resolve("NOT_A_UNIQ_ACCT");
                }
            });

        });
    }

    // This function will check if account is valid 
    // also will check whether transaction amount is greather than account balance.
    function validateAccountAndBalance(account, tranamount) {
        return new Promise(function (resolve, reject) {
            let accountModel = loopback.findModel("Account");
            let whereClause = { where: { accountid: account } };
            accountModel.find(whereClause, function (err, res) {
                if (res.length <= 0) {
                    resolve("NO_SUCH_ACCT");
                }
                else if (res.length === 1) {
                    // check whether sufficient balance is present
                    if (res[0].balance < tranamount) {
                        resolve("INSUFFICIENT_BAL");
                    }
                    resolve("VALID_ACCT");
                }
                else {
                    resolve("NOT_A_UNIQ_ACCT");
                }
            });

        });
    }



    function doTransaction(paymentMsg) {
        return new Promise(function (resolve, reject) {
            let tranModel = loopback.findModel("Transaction");
            let response = {};
            // Transaction is created in posted status
            paymentMsg.transtatus = 'P';
            // function is supposed to give transaction id back.
            tranModel.create(paymentMsg, function (err, resultTran) {
                if (err) {
                    reject(err);
                }
                else {
                    console.log("tran id  "+resultTran.transactionid);
                    resolve(resultTran.transactionid);
                }

            });

        });
    }

    Transaction.remoteMethod('makePayment', {
        accepts: [{ arg: 'paymentMsg', type: 'object', http: { source: 'body' } }],
        returns: [{ arg: 'tranId', 'type': 'string' }],
        http: { path: '/makePayment', verb: 'post' }
    });

}