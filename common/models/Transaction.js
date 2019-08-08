
let loopback = require('loopback');
module.exports = function (Transaction) {

    Transaction.makePayment = function (paymentMsg, cb) {
        let tranId = "1";
        console.dir(paymentMsg,{depth : null , colors : true});
        /* 
           Payment message has 
           1) paymentMsg.creditAccount
           2) paymentMsg.debitAcct 
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
        validateAccount(paymentMsg.creditAccount).then(
            result => {
                if (result === 'VALID_ACCT')
                    cb(null, 'VALID_ACCT');
                else
                    cb(null, 'INVALID_ACCT');
            }
        )

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

    Transaction.remoteMethod('makePayment', {
        accepts: [{ arg: 'paymentMsg', type: 'object' ,http: { source: 'body' }}  ],
        returns: [{ arg: 'tranId', 'type': 'string' }],
        http: { path : '/makePayment', verb : 'post'}
    });

}