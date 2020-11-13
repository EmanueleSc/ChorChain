import express from "express"
const router = express.Router()
const ChorModel = require("../../db/chormodel")
const ChorInstance = require("../../db/chorinstance")
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
import { ChorTranslator } from '../utils/translator'
const ChannelU = require("../utils/channelu")

router.get('/create', async (req, res) => {
    try {
        const { idModel } = req.query
        const model = await ChorModel.findOne({ idModel: mongoose.Types.ObjectId(idModel) })
        const fileName = model.fileName

        // Get the xml of the bpmn file
        const bpmnFilePath = path.resolve(__dirname, `../bpmnFiles/${fileName}`)
        const chorXml = fs.readFileSync(bpmnFilePath, {encoding:'utf8', flag:'r'})

        // ChorTranslator is the Choreography translator module for Hyperledger Fabric smart contracts.
        // it returns an object with the following fields:
        //      object.chorID
        //      object.roles
        //      object.configTxProfile
        //      object.startEvent
        //      object.modelName
        //      object.contract (the translated contract code)
        //      object.contractName
        const obj = await new ChorTranslator(chorXml, idModel)
        const idChorLedger = obj.chorID
        const startEvent = obj.startEvent
        const roles = obj.roles
        const contractName = obj.contractName
        const channel = `channel${idChorLedger}`
        const configTxProfile = obj.configTxProfile
        const contractVersion = 1
        const contract = obj.contract
        // Initialize subscriptions to null (no user subscribed to any role)
        const subscriptions = {}
        Object.keys(roles).forEach(key => subscriptions[key] = null)

        // write smart contract file inside chaincode
        const code = contract.toString('utf8')
        const chaincodeFile = path.resolve(__dirname, `../../../../chaincode/lib/choreographyprivatedatacontract.js`)
        fs.writeFileSync(chaincodeFile, code)

        // package the chaincode
        await ChannelU.packageChaincode(contractName, contractVersion)

        // create choreography instance in mongoDB
        const chor = await ChorInstance.create({
            idModel,
            idChorLedger,
            startEvent,
            roles,
            contractName,
            channel,
            configTxProfile,
            contractVersion,
            deployed: false,
            idUsersSubscribed: [],
            subscriptions
        })

        res.json({ response: chor })
        
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

router.get('/instances', async (req, res) => {
    try {
        const { idModel } = req.query
        const chors = await ChorInstance.find({ idModel: mongoose.Types.ObjectId(idModel) })

        res.json({ response: chors })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

router.post('/instances/deployed', async (req, res) => {
    try {
        const { idUser } = req.body
        const chors = await ChorInstance.aggregate([
            {
                $match: {
                  $and: [
                    { idUsersSubscribed: mongoose.Types.ObjectId(idUser) },
                    { deployed: true }
                  ]
                }
            },
            {
                $lookup: {
                    from: 'fabchormodels',
                    localField: 'idModel',
                    foreignField: 'idModel',
                    as: 'model'
                }
            }
        ])

        res.json({ response: chors })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

/*router.post('/fetch', async (req, res) => {
    try {
        const chors = await ChorInstance.find()

        res.json({ response: chors })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})*/

router.post('/fetch/file', async (req, res) => {
    try {
        const { idBpmnFile } = req.body
        const file = path.resolve(__dirname, `../bpmnFiles/${idBpmnFile}`)
        const xml = fs.readFileSync(file, { encoding:'utf8', flag:'r' })
        res.json({ response: xml })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

router.get('/subscribe', async (req, res) => {
    try {
        const { idUser, idChorInstance, subRole } = req.query
        
        let chorinstance = await ChorInstance.findOne({ _id: mongoose.Types.ObjectId(idChorInstance) }).exec()
        if(!chorinstance) {
            return res.status(404).send('Chor instance document not found.')
        }

        let idUsersSubscribed = chorinstance.idUsersSubscribed
        const roles = chorinstance.roles
        let subscriptions = chorinstance.subscriptions

        // Ensures that the maximum number of subscriptions is not exceeded
        if(idUsersSubscribed.length === Object.keys(roles).length) {
            return res.status(405).send('Maximum number of subscriptions exceeded.')
        }

        // Ensure that the subscribed role exists in the choreography instance
        if(!(subRole in roles) && !(subRole in subscriptions)) {
            return res.status(405).send('Role not exists in the choreography instance.')
        }

        // Ensure that the role is not already subscribed
        if(subscriptions[subRole] !== null) {
            return res.status(405).send('Role already subscribed, operation not allowed.')
        }

        // Update document: user subscription to the specific role
        idUsersSubscribed.push(mongoose.Types.ObjectId(idUser))
        subscriptions[subRole] = idUser

        const response = await ChorInstance.update(
            { _id: chorinstance._id },
            { $set: { idUsersSubscribed, subscriptions } }
        )


        res.json({ response })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router