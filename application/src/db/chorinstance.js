const mongoose = require('mongoose')

const chorinstanceSchema = mongoose.Schema({
  idBpmnFile: String,
  bpmnFileName: String,
  startEvent: String,                               // e.g. 'Event_0tttznh'
  roles: Object,                                    // e.g. { Customer: 'Org1MSP', Bike_center: 'Org2MSP', Insurer: 'Org3MSP' }
  idChor: String,                                   // e.g. 'CHOR1'
  contractName: String,                             // e.g. 'org.chorchain.choreographyprivatedata_1'
  channel: String,                                  // e.g. 'channel123'
  configTxProfile: { type: String, enum: ['TwoOrgsChannel', 'ThreeOrgsChannel'] },
  contractVersion: Number,
  created_at: { type: Date, required: true, default: Date.now },
  deployed: { type: Boolean, default: false }       // contract deployed into blockchain net (true), not deployed otherwise (false)
})

module.exports = mongoose.model('chorinstance', chorinstanceSchema)
