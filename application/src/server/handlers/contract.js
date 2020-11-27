import express from "express"
const router = express.Router()
const ChorModel = require("../../db/chormodel")
const ChorInstance = require("../../db/chorinstance")
const ChannelU = require("../utils/channelu")
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
import { ChorTranslator } from '../utils/translator'
const yaml = require('js-yaml')
const CryptoPeerUser = require('../utils/cryptopeeruser')

const highlightLog = (message) => {
    console.log(`##############################################################################`)
    console.log(`### ${message} ###`)
    console.log(`##############################################################################`)

}

router.post('/deploy', async (req, res) => {

    const { idChorLedger, contractVersion } = req.body

    let chorinstance = await ChorInstance.findOne({ idChorLedger }).exec().catch(err => res.json({ error: err.message || err.toString() }))
    const configTxProfile = chorinstance.configTxProfile
    const contractName = chorinstance.contractName
    const channel = chorinstance.channel
    const cVersion = contractVersion || 1 // !!! NOTE: update of the contract not handled !!!
    const idModel = chorinstance.idModel
    const subscriptions = chorinstance.subscriptions

    // check if subscriptions are completed
    for (const [key, value] of Object.entries(subscriptions)) {
        if(!value) {
            return res.status(405).send(`The role ${key} is missing the subscription.`)
        }
    }

    // translation of the model and packaging of the contract
    const model = await ChorModel.findOne({ idModel: mongoose.Types.ObjectId(idModel) })
    const fileName = model.fileName
    // Get the xml of the bpmn file
    const bpmnFilePath = path.resolve(__dirname, `../bpmnFiles/${fileName}`)
    const chorXml = fs.readFileSync(bpmnFilePath, {encoding:'utf8', flag:'r'})
    // contract generation and subscription encoding into the contract
    const obj = await new ChorTranslator(chorXml, idModel, true, idChorLedger, subscriptions)
    const contract = obj.contract
    // write smart contract file inside chaincode
    const code = contract.toString('utf8')
    const chaincodeFile = path.resolve(__dirname, `../../../../chaincode/lib/choreographyprivatedatacontract.js`)
    fs.writeFileSync(chaincodeFile, code)
    // package the chaincode
    await ChannelU.packageChaincode(contractName, idModel, contractVersion)

    // ================================================================================================================
    // TODO DEPLOY REFACTORING ...
    const RETRY = 25
    let STOP = false
    const numOrgs = Object.keys(obj.roles).length

    for (let i = 1; i <= RETRY; i++) {
        try {
            highlightLog(`Generating Channel Transaction for: ${channel}`)
            await ChannelU.generateChannelTransaction(channel, configTxProfile, idModel)

            for(let k = 1; k <= numOrgs; k++) {
                const orgMspID =  `Org${k}MSP${idModel}`
                const org = `org${k}.${idModel}.com`
                const ccpFile = `connection-org${k}.yaml`
                const peer0 = `peer0.org${k}.${idModel}.com`

                highlightLog(`Generating Anchor Peer Transaction for org${k}.${idModel}.com`)
                await ChannelU.generateAnchorPeerTransaction(channel, configTxProfile, orgMspID, idModel)

                const ccpPath = CryptoPeerUser.getConnectionProfilePath(org, ccpFile)
                const ccp = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'))
                const peer0Url = ccp.peers[peer0].url

                highlightLog(`Join Peer0 Org${k}`)
                const client = await ChannelU.createClient(org, orgMspID, ccpFile)

                // =============================================================================================
                // TODO: refactoring createChannel and joinChannel methods
                if(k === 1) await ChannelU.createChannel(client, channel) // create the channel only one time
                await ChannelU.joinChannel(client, channel, org, peer0Url)
                // =============================================================================================
            }
        
            /*highlightLog(`Join Peer Org1`)
            const client = await ChannelU.createClient('org1.example.com', 'Org1MSP', 'connection-org1.yaml')
            await ChannelU.createChannel(client, channel)
            await ChannelU.joinChannel(client, channel, 'org1.example.com', 'grpcs://localhost:7051')

            highlightLog(`Join Peer Org2`)
            const client2 = await ChannelU.createClient('org2.example.com', 'Org2MSP', 'connection-org2.yaml')
            await ChannelU.joinChannel(client2, channel, 'org2.example.com', 'grpcs://localhost:9051')

            highlightLog(`Join Peer Org3`)
            const client3 = await ChannelU.createClient('org3.example.com', 'Org3MSP', 'connection-org3.yaml')
            await ChannelU.joinChannel(client3, channel, 'org3.example.com', 'grpcs://localhost:11051')*/

            // TODO: refactoring bash scripts
            highlightLog(`Update Anchor Peers definition for: ${channel}`)
            await ChannelU.update3OrgsAnchorPeers(channel).catch(e => undefined) // skip this error

            // TODO: refactoring bash scripts
            highlightLog(`Deploying Contract: ${contractName}`)
            await ChannelU.deploy3OrgsContract(channel, contractName, cVersion).then(() => { STOP = true })

            if(STOP) break
            
        } catch (err) {
            console.log(err)
        }

    }

    // update choreography instance deployed field
    highlightLog('Updating Mongodb Chor instance (deployed = true)')
    chorinstance.deployed = true
    await chorinstance.save().catch(err => res.json({ error: err.message || err.toString() }))

    res.json({ response: 'Contract successfully deployed!' })     
})

module.exports = router