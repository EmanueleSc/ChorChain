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

    const RETRY = 25
    let STOP = false
    const numOrgs = Object.keys(obj.roles).length

    for (let i = 1; i <= RETRY; i++) {
        try {
            highlightLog(`Generating Channel Transaction for: ${channel}`)
            await ChannelU.generateChannelTransaction(channel, configTxProfile, idModel)

            let ordererPort = ''
            let ordererAddress = ''
 
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
                const peerTlsCACert = ccp.peers[peer0].tlsCACerts.pem

                highlightLog(`Join Peer0 Org${k}`)
                const client = await ChannelU.createClient(org, orgMspID, ccpFile)

                // get the orderer port from configtx.yaml file
                const configtxPath = path.resolve(__dirname, `../../../../test-network/configtx/${idModel}/configtx.yaml`)
                const configtx = yaml.safeLoad(fs.readFileSync(configtxPath, 'utf8'))
                
                for(const org of configtx.Organizations) {
                    if(org.OrdererEndpoints) {
                        ordererPort = org.OrdererEndpoints[0].split(':')[1]
                    }
                }
                const ordererUrl = `grpcs://localhost:${ordererPort}`
                ordererAddress = `localhost:${ordererPort}`

                // create the channel only one time
                if(k === 1) {
                    await ChannelU.createChannel(client, channel, idModel, ordererUrl)
                }
                // join the peer0 to the channel
                await ChannelU.joinChannel(client, channel, org, peer0Url, peerTlsCACert, idModel, ordererUrl)

                // Update anchor peer
                highlightLog(`Update Anchor Peer definition for: ${channel}`)
                await ChannelU.updateOrgAnchorPeer(channel, k, idModel, ordererAddress).catch(e => undefined) // skip this error
            }

            // TODO: refactoring bash scripts
            highlightLog(`Deploying Contract: ${contractName}`)
            // await ChannelU.deploy3OrgsContract(channel, contractName, cVersion).then(() => { STOP = true }) // OLD VERSION (STATIC DEPLOY)

            // TODO: autogen collections policy 
            let policy = [
                {
                    "name": "collectionOrg1MSPOrg2MSP",
                    "policy": "OR('Org1MSP.member', 'Org2MSP.member')",
                    "requiredPeerCount": 1,
                    "maxPeerCount": 3,
                    "blockToLive":1000000,
                    "memberOnlyRead": true,
                    "memberOnlyWrite": true
                },
                {
                    "name": "collectionOrg1MSPOrg3MSP",
                    "policy": "OR('Org1MSP.member', 'Org3MSP.member')",
                    "requiredPeerCount": 1,
                    "maxPeerCount": 3,
                    "blockToLive":1000000,
                    "memberOnlyRead": true,
                    "memberOnlyWrite": true
                },
                {
                    "name": "collectionOrg2MSPOrg3MSP",
                    "policy": "OR('Org2MSP.member', 'Org3MSP.member')",
                    "requiredPeerCount": 1,
                    "maxPeerCount": 3,
                    "blockToLive":1000000,
                    "memberOnlyRead": true,
                    "memberOnlyWrite": true
                }
            ]
            policy=JSON.stringify(policy, null, 4)
            policy=JSON.stringify(policy, null, "\t")

            await ChannelU.deployOrgsContract(channel, contractName, cVersion, policy, idModel, numOrgs, ordererAddress) // NEW VERSION (DYNAMIC DEPLOY)

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