var PROTOCOL = 0x4343
var VERSION = 0x01
var MAXBYTESIZE = 40
var OP_CODES = {
  'issuance': {
    'start': 0x00,
    'end': 0x0f,
    'encoder': require('cc-issuance-encoder')
  },
  'transfer': {
    'start': 0x10,
    'end': 0x1f,
    'encoder': require('cc-transfer-encoder')
  }
}

var encodingLookup = {}

for (var transactionType in OP_CODES) {
  for (var j = OP_CODES[transactionType].start; j <= OP_CODES[transactionType].end; j++) {
    encodingLookup[j] = {}
    encodingLookup[j].encode = OP_CODES[transactionType].encoder.encode
    encodingLookup[j].decode = OP_CODES[transactionType].encoder.decode
    encodingLookup[j].type = transactionType
  }
}

var paymentsInputToSkip = function (payments) {
  var result = JSON.parse(JSON.stringify(payments))
  result.sort(function (a, b) {
    return a.input - b.input
  })
  for (var i = 0; i < result.length; i++) {
    var skip = false
    if (result[i + 1] && result[i + 1].input > result[i].input) {
      skip = true
    }
    delete result[i].input
    result[i].skip = skip
  }
  return result
}

var paymentsSkipToInput = function (payments) {
  var paymentsDecoded = []
  var input = 0
  for (var i = 0; i < payments.length; i++) {
    paymentsDecoded.push({
      input: input,
      amountOfUnits: payments[i].amountOfUnits,
      output: payments[i].output,
      range: payments[i].range,
      precent: payments[i].precent
    })
    if (payments[i].skip) input = input + 1
  }
  return paymentsDecoded
}

function Transaction (data) {
  data = data || {}
  this.type = data.type || 'transfer'
  this.noRules = data.noRules || true
  this.payments = data.payments || []
  this.protocol = data.protocol || PROTOCOL
  this.version = data.version || VERSION
  this.lockStatus = data.lockStatus
  this.divisibility = data.divisibility
  this.amountOfUnits = data.amountOfUnits
  if (typeof this.amountOfUnits !== 'undefined'
    && typeof this.divisibility !== 'undefined') {
    this.amount = this.amountOfUnits / Math.pow(10, this.divisibility)
  }
  this.sha2 = data.sha2
  this.torrentHash = data.torrentHash
}

Transaction.createFromHex = function (op_return) {
  if (!Buffer.isBuffer(op_return)) {
    op_return = new Buffer(op_return, 'hex')
  }
  var decoder = encodingLookup[op_return[3]]
  var rawData = decoder.decode(op_return)
  rawData.type = decoder.type
  rawData.payments = paymentsSkipToInput(rawData.payments)
  return new Transaction(rawData)
}

Transaction.newTransaction = function (protocol, version) {
  return new Transaction({protocol: protocol, version: version})
}

Transaction.prototype.addPayment = function (input, amount, output, range, precent) {
  range = range || false
  precent = precent || false
  this.payments.push({input: input, amountOfUnits: amount, output: output, range: range, precent: precent})
}

Transaction.prototype.setAmount = function (amount, divisibility) {
  this.type = 'issuance'
  this.divisibility = divisibility || 0
  this.amount = amount
  this.amountOfUnits = this.amount * Math.pow(10, this.divisibility)
}

Transaction.prototype.setLockStatus = function (lockStatus) {
  this.lockStatus = lockStatus
  this.type = 'issuance'
}

Transaction.prototype.allowRules = function () {
  this.noRules = false
}

Transaction.prototype.setHash = function (torrentHash, sha2) {
  if (!torrentHash) throw new Error('Can\'t set hashes without the torrent hash')
  this.torrentHash = torrentHash
  if (sha2) this.sha2 = sha2
}

Transaction.prototype.encode = function () {
  var encoder = OP_CODES[this.type].encoder
  this.payments = paymentsInputToSkip(this.payments)
  var result = encoder.encode(this, MAXBYTESIZE)
  this.payments = paymentsSkipToInput(this.payments)
  // console.log(this)
  return result
}

Transaction.prototype.toJson = function () {
  var data = {}
  data.payments = this.payments
  data.protocol = this.protocol
  data.version = this.version
  data.type = this.type
  if (this.type === 'issuance') {
    data.lockStatus = this.lockStatus
    data.divisibility = this.divisibility
    data.amount = this.amount
    data.amountOfUnits = this.amount * Math.pow(10, this.divisibility)
  }

  if (this.torrentHash) {
    data.torrentHash = this.torrentHash.toString('hex')
    if (this.sha2) data.sha2 = this.sha2.toString('hex')
  }
  return data
}

module.exports = Transaction
