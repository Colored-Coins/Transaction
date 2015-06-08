var PROTOCOL = 0x12
var VERSION = 0x11

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

var MAXBYTESIZE = 40

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
  this.payments = paymentsSkipToInput(this.payments)
  this.protocol = data.protocol
  this.version = data.version
  if (typeof data.amountOfUnits !== 'undefined'
    && typeof data.lockStatus !== 'undefined'
    && typeof data.divisibility !== 'undefined') {
    this.type = 'issuance'
    this.divisibility = data.divisibility
    this.lockStatus = data.lockStatus
    this.amount = data.amountOfUnits / Math.pow(10, data.divisibility)
  }
  if (data.sha2) this.sha2 = data.sha2
  if (data.torrentHash) this.torrentHash = data.torrentHash
}

Transaction.createFromHex = function (op_return) {
  if (!Buffer.isBuffer(op_return)) {
    op_return = new Buffer(op_return, 'hex')
  }
  var decoder = encodingLookup[op_return[3]]
  var rawData = decoder.decode(op_return)
  rawData.type = decoder.type
  return new Transaction(rawData)
}

Transaction.newTransaction = function (protocol, version) {
  protocol = protocol || PROTOCOL
  version = version || VERSION
  return new Transaction({data: {protocol: protocol, version: version}})
}

Transaction.prototype.addPayment = function (input, amount, output, range, precent) {
  range = range || false
  precent = precent || false
  this.payments.push({input: input, amount: amount, output: output, range: range, precent: precent})
}

Transaction.prototype.setAmount = function (totalAmount, divisibility) {
  divisibility = divisibility || 0
  this.amount = totalAmount
}

Transaction.prototype.setLockStatus = function (lockStatus) {
  this.lockStatus = lockStatus
}

Transaction.prototype.allowRules = function () {
  this.noRules = false
}

Transaction.prototype.setHash = function (torrentHash, sha2) {
  if (!torrentHash) throw new Error('Can\'t set hashes without the torrent hash')
  this.torrentHash = torrentHash
  if (sha2) this.sha2 = sha2
}

Transaction.prototype.isIssue = function () {
  return (typeof this.divisibility !== 'undefined'
    && typeof this.amount !== 'undefined'
    && typeof this.lockStatus !== 'undefined')
}

Transaction.prototype.encode = function () {
  var data = {}
  data.payments = paymentsInputToSkip(this.payments)
  data.protocol = this.protocol
  data.version = this.version
  if (typeof this.divisibility !== 'undefined'
    && typeof this.amount !== 'undefined'
    && typeof this.lockStatus !== 'undefined') {
    this.type = 'issuance'
    data.lockStatus = this.lockStatus
    data.amountOfUnits = this.amount * Math.pow(10, this.divisibility)
    data.divisibility = this.divisibility
  }
  if (this.torrentHash) {
    data.torrentHash = this.torrentHash
    if (this.sha2) data.sha2 = this.sha2
  }
  var encoder = OP_CODES[this.type].encoder
  return encoder.encode(data, MAXBYTESIZE)
}

module.exports = Transaction
