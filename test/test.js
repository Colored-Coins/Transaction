var Transaction = require(__dirname + '/../Transaction')
var assert = require('assert')

describe('Create Transaction from raw data', function () {
  this.timeout(0)
  var torrentHash = new Buffer(20)
  var sha2 = new Buffer(32)
  var hex3 = '434301028d5e6b9e6543d917e9a1a35e3680dabc4922750c201201201210'
  var data = {
    type: 'issuance',
    amount: 13232,     
    divisibility: 2,
    lockStatus: false,
    protocol: 0x4343,
    version: 0x02,
    sha2: sha2,
    torrentHash: torrentHash,
    payments: [
      {input: 0, range: false, percent: false, output: 0, amount: 1},
      {input: 0, range: false, percent: false, output: 1, amount: 2},
      {input: 1, range: false, percent: false, output: 2, amount: 3},
      {input: 2, range: false, percent: false, output: 3, amount: 4},
      {input: 2, range: false, percent: false, output: 4, amount: 5},
      {input: 3, range: false, percent: false, output: 5, amount: 6}
    ]
  }
  var transaction = new Transaction(data)
  var transactionJson1, transactionJson2, code, multiSig

  it('should return the right encoding/decoding for raw created transaction', function (done) {
    transactionJson1 = transaction.toJson()
    // console.log('First transaction Object: ', transactionJson1)
    code = transaction.encode()
    // console.log('First transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // console.log('transactionJson3', Transaction.fromHex(hex3).toJson())
    // console.log('First transaction decoded back: ', transactionJson2)
    multiSig = transactionJson2.multiSig
    transactionJson2.multiSig = []
    delete transactionJson1.sha2
    delete transactionJson1.torrentHash
    delete transactionJson2.sha2
    delete transactionJson2.torrentHash
    assert.deepEqual(multiSig, [], 'Not Equal')
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should return right encoded amount for version 0x02', function (done) {
    var consumer = function (buff) {
      var curr = 0
      return function consume (len) {
        return buff.slice(curr, curr += len)
      }
    }

    var toBuffer = function (val) {
      val = val.toString(16)
      if (val.length % 2 == 1) {
        val = '0'+val
      }
      return new Buffer(val, 'hex')
    }

    var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length - 1))
    assert.deepEqual(toBuffer(transactionJson1.protocol), consume(2))
    assert.deepEqual(toBuffer(transactionJson1.version), consume(1))
    assert.deepEqual(toBuffer('01'), consume(1))  //issuance OP_CODE
    consume(20) //torrent-hash
    consume(32) //sha2
    assert.deepEqual(new Buffer('433b00', 'hex'), consume(3))
    done()
  })

  it('should return the right encoding/decoding for changed amount', function (done) {
    transaction.setAmount(123, 4)
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transactionJson1)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    multiSig = transactionJson2.multiSig
    transactionJson2.multiSig = []
    delete transactionJson1.sha2
    delete transactionJson1.torrentHash
    delete transactionJson2.sha2
    delete transactionJson2.torrentHash
    assert.deepEqual(multiSig, [], 'Not Equal')
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    assert.equal(transactionJson2.amount, 123, 'Wrong total amount of units')
    assert.equal(transactionJson1.amount, 123, 'Wrong total amount of units')

    done()
  })

  it('should encode an empty transfer transaction', function (done) {
    transaction = Transaction.newTransaction()
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
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
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
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
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should encode an empty issuance transaction', function (done) {
    transaction = Transaction.newTransaction(0x4343, 0x02)
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
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

  it('should encode a burn transaction', function (done) {
    transaction = Transaction.newTransaction(0x4343, 0x02)
    transaction.addPayment(0, 7, 2)
    transaction.addBurn(1, 5, false)
    transactionJson1 = transaction.toJson()
    // console.log('Second transaction Object: ', transactionJson1)
    code = transaction.encode()
    // console.log('Second transaction code: ', code)
    transactionJson2 = Transaction.fromHex(code.codeBuffer).toJson()
    // console.log('second transaction decoded back: ', transactionJson2)
    assert.equal(transactionJson1.type, 'burn')
    assert.deepEqual(transactionJson1, transactionJson2, 'Not Equal')
    done()
  })

})
