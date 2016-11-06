# Colored Coins Transaction
[![Build Status](https://travis-ci.org/Colored-Coins/Transaction.svg?branch=master)](https://travis-ci.org/Colored-Coins/Transaction) [![Coverage Status](https://coveralls.io/repos/Colored-Coins/Transaction/badge.svg?branch=master)](https://coveralls.io/r/Colored-Coins/Transaction?branch=master) [![npm version](https://badge.fury.io/js/cc-transaction.svg)](http://badge.fury.io/js/cc-transaction) [![Slack Status](http://slack.coloredcoins.org/badge.svg)](http://slack.coloredcoins.org)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Colored Coins Transaction provides the basic functionality for creating and managing a Colored Coins Transaction Object

### Installation

```sh
$ npm install cc-transaction
```

### properties

```js
// which type is the transaction ('issue'/'send'/'burn') [String]
this.type
// [Boolean]
this.noRules
// transfer objects to pass assets from inputs to outputs [Array[Object]] 
this.payments
// [Number]
this.protocol
// Colored-Coins protocol version [Number]
this.version
// how many places after the decimal point can the smallest asset amount be (for example divisibility 2 => smallest asset amount is 0.01) [Number]
this.divisibility
// is an issued asset locked or can it be re-issued [Boolean]
this.lockStatus
// amount of units of an asset to issue [Number]
this.amount
// SHA2 of the metadata [Buffer]
this.sha2
// the torrent hash of the metadata torrent [Buffer]
this.torrentHash
// list of objects which indicate how a multisig stores the hashes (index and type) [Array[Object]]
this.multiSig
```


### TODO - Write documentation to the following functions

```js
function Transaction (rawData)
Transaction.fromHex = function (op_return)
Transaction.newTransaction = function (protocol, version)
Transaction.prototype.addPayment = function (input, amount, output, range,percent)
Transaction.prototype.addBurn = function (input, amount, percent)
Transaction.prototype.setAmount = function (totalAmount, divisibility)
Transaction.prototype.setLockStatus = function (lockStatus)
Transaction.prototype.setAggregationPolicy = function (aggregationPolicy)
Transaction.prototype.setHash = function (torrentHash, sha2)
Transaction.prototype.encode = function ()
Transaction.prototype.shiftOutputs = function(shiftAmount)

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