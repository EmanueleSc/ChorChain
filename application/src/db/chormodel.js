const mongoose = require('mongoose')

const chormodelSchema = mongoose.Schema({
  fileName: String,                                                 // filesystem bpmn file name (id model + .bpmn)
  modelName: String,                                                // choreography name
  idUser: mongoose.Schema.Types.ObjectId,                           // id user of the model
  idModel: mongoose.Schema.Types.ObjectId,                          // id choreography model (EthUsers db)
  created_at: { type: Date, required: true, default: Date.now },    // document creation date
})

module.exports = mongoose.model('fabchormodel', chormodelSchema)