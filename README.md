# Colored Coins Transaction
[![Build Status](https://travis-ci.org/Colored-Coins/Transaction.svg?branch=master)](https://travis-ci.org/Colored-Coins/Transaction) [![Coverage Status](https://coveralls.io/repos/Colored-Coins/Transaction/badge.svg?branch=master)](https://coveralls.io/r/Colored-Coins/Transaction?branch=master) [![npm version](https://badge.fury.io/js/cc-transaction.svg)](http://badge.fury.io/js/cc-transaction)

Colored Coins Transaction provides the basic functionality for creating and managing a Colored Coins Transaction Object

### Installation

```sh
$ npm install cc-transaction
```

### TODO - Write documentation to the following properties

```js
this.type
this.noRules
this.payments
this.protocol
this.version
this.divisibility
this.lockStatus
this.amount
this.sha2
this.torrentHash
this.multiSig
```


### TODO - Write documentation to the following functions

```js
function Transaction (rawData)
Transaction.createFromHex = function (op_return)
Transaction.newTransaction = function (protocol, version)
Transaction.prototype.addPayment = function (input, amount, output, range,precent)
Transaction.prototype.setAmount = function (totalAmount, divisibility)
Transaction.prototype.setLockStatus = function (lockStatus)
Transaction.prototype.setHash = function (torrentHash, sha2)
Transaction.prototype.isIssue = function ()
Transaction.prototype.encode = function ()

```

### Testing

In order to test you need to install [mocha] globaly on your machine

```sh
$ cd /"module-path"/cc-transaction
$ mocha
```


License
----

MIT


[mocha]:https://www.npmjs.com/package/mocha