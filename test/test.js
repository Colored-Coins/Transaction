var Transaction = require(__dirname + '/../Transaction')
var assert = require('assert')

describe('Create Transaction from raw data', function () {
  this.timeout(0)
  var torrentHash = new Buffer(20)
  var sha2 = new Buffer(32)

  var data = {
    type: 'issuance',
    amountOfUnits: 1323200,
    divisibility: 3,
    lockStatus: false,
    protocol: 0x4343,
    version: 0x01,
    sha2: sha2,
    torrentHash: torrentHash,
    payments: [
      {input: 0, range: false, precent: false, output: 0, amountOfUnits: 1},
      {input: 0, range: false, precent: false, output: 1, amountOfUnits: 2},
      {input: 1, range: false, precent: false, output: 2, amountOfUnits: 3},
      {input: 2, range: false, precent: false, output: 3, amountOfUnits: 4},
      {input: 2, range: false, precent: false, output: 4, amountOfUnits: 5},
      {input: 3, range: false, precent: false, output: 5, amountOfUnits: 6}
    ]
  }
  var transaction = new Transaction(data)
  var transactionJson1, transactionJson2, code
  it('should return the right encoding/decoding for raw created transaction', function (done) {
    transactionJson1 = transaction.toJson()
    // console.log('First transaction Object: ', transactionJson1)
    code = transaction.encode()
    // console.log('First transaction code: ', code)
    transactionJson2 = Transaction.createFromHex(code.codeBuffer).toJson()
    // console.log('First transaction decoded back: ', transactionJson2)
    delete transactionJson1.sha2
    delete transactionJson1.torrentHash
    delete transactionJson2.sha2
    delete transactionJson2.torrentHash
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })
  it('should return the right encoding/decoding for changed amount', function (done) {
    transaction.setAmount(123, 4)
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transactionJson1)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.createFromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    delete transactionJson1.sha2
    delete transactionJson1.torrentHash
    delete transactionJson2.sha2
    delete transactionJson2.torrentHash
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    assert.equal(transactionJson2.amountOfUnits, 1230000, 'Wrong total amount of units')
    assert.equal(transactionJson1.amountOfUnits, 1230000, 'Wrong total amount of units')

    done()
  })

  it('should encode an empty transfer transaction', function (done) {
    transaction = Transaction.newTransaction()
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.createFromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should return the right encoding/decoding for newly created transaction', function (done) {
    transaction.addPayment(0, 12, 3)
    transaction.addPayment(0, 12, 3, true)
    transaction.addPayment(1, 132, 1, false, true)
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.createFromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should return the right encoding/decoding for newly created issuance transaction', function (done) {
    transaction.setAmount(123, 4)
    transaction.setLockStatus(false)
    transaction.addPayment(2, 132, 4)
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.createFromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should encode an empty issuance transaction', function (done) {
    transaction = Transaction.newTransaction(0x4343, 0x01)
    var a = {}
    assert.throws(function () {
      transaction.setAmount(a.c, a.d)
    }, 'Amount has to be defined'
    , 'Amount has to be defined')
    transaction.setLockStatus(false)
    transaction.setAmount(10, 3)
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.createFromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

})
