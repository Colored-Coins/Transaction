var Transaction = require(__dirname + '/../Transaction')

describe('Create Transaction from raw data', function () {
  it('should return the right decoding', function (done) {
    this.timeout(0)
    var torrentHash = new Buffer(20)
    torrentHash.fill(0)
    torrentHash[3] = 0x23
    torrentHash[4] = 0x2f
    torrentHash[2] = 0xd3
    torrentHash[12] = 0xe3
    torrentHash[19] = 0xa3
    torrentHash[11] = 0x21
    var sha2 = new Buffer(32)
    sha2.fill(0)
    sha2[0] = 0xf3
    sha2[1] = 0x2f
    sha2[12] = 0x23
    sha2[16] = 0xf3
    sha2[30] = 0x2f
    sha2[21] = 0x23
    sha2[11] = 0x2f

    var data = {
      type: 'issuance',
      amountOfUnits: 1323200,
      divisibility: 3,
      lockStatus: false,
      protocol: 0x1302, // Error when start with 0
      version: 0x13,
      sha2: sha2,
      torrentHash: torrentHash,
      payments: [
        {skip: false, range: false, precent: false, output: 0, amountOfUnits: 1},
        {skip: false, range: false, precent: false, output: 1, amountOfUnits: 2},
        {skip: true, range: false, precent: false, output: 2, amountOfUnits: 3},
        {skip: false, range: false, precent: false, output: 3, amountOfUnits: 4},
        {skip: true, range: false, precent: false, output: 4, amountOfUnits: 5},
        {skip: false, range: false, precent: false, output: 5, amountOfUnits: 6}
      ]
    }
    var transaction = new Transaction(data)
    console.log('First transaction Object: ', transaction)
    var code = transaction.encode()
    console.log('First transaction code: ', code)
    console.log('First transaction decoded back: ', Transaction.createFromHex(code.codeBuffer))

    transaction.setAmount(123, 4)
    console.log('Second transaction Object: ', transaction)
    code = transaction.encode()
    console.log('Second transaction code: ', code)
    console.log('second transaction decoded back: ', Transaction.createFromHex(code.codeBuffer))

    done()
  })

})
