# PaymentService
Payment service is a illustration of simple transfer between accounts in the bank.
This service can be used for testing of simple scenarios .

Many of the times , simple mocking or stubbing of payment api's can not be used as mocking and stubbing works on the request data .
In such cases , backend can be this simple payment services based on node.js and loopback 
## Scenarios handled .
* Credit/Debit Account in payment is invalid 
* Debit Account does not have sufficient balance 
* Account has lien placed on it ( WIP)
* Account is frozen ( WIP)

## Database used 
* Sqllite database is used for storing customer , account transactions
* Loopback framework is used for creating apis.

