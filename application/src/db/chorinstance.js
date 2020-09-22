const mongoose = require('mongoose')

const chorinstanceSchema = mongoose.Schema({
  idBpmnFile: String,
  bpmnFileName: String,
  startEvent: String,                                     // e.g. 'Event_0tttznh'
  roles: Object,                                          // e.g. { Customer: 'Org1MSP', Bike_center: 'Org2MSP', Insurer: 'Org3MSP' }
  idChor: String,                                         // e.g. 'CHOR1'
  idModel: mongoose.Schema.Types.ObjectId,                // id choreography model on EthUsers db
  contractName: String,                                   // e.g. 'org.chorchain.choreographyprivatedata_1'
  channel: String,                                        // e.g. 'channel123'
  configTxProfile: { type: String, enum: ['TwoOrgsChannel', 'ThreeOrgsChannel'] },
  contractVersion: Number,
  created_at: { type: Date, required: true, default: Date.now },
  deployed: { type: Boolean, default: false },            // contract deployed into blockchain net (true), not deployed otherwise (false)
  idUsersSubscribed: [mongoose.Schema.Types.ObjectId],    // array of subscribed users, default empty
  subscriptions: Object                                   // mapping object between user ids (string) and roles e.g. { Customer: 'idUser1', Bike_center: null, Insurer: null }
})

module.exports = mongoose.model('chorinstance', chorinstanceSchema)
