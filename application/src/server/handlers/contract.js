import express from "express"
const router = express.Router()
const ChorInstance = require("../../db/chorinstance")
const ChannelU = require("../utils/channelu")
const ChorTranslator = require("../utils/translator")

const highlightLog = (message) => {
    console.log(`##############################################################################`)
    console.log(`### ${message} ###`)
    console.log(`##############################################################################`)

}

router.post('/translate', async (req, res) => {
    try {
        const { chorxml } = req.body
        
        // ChorTranslator is the Choreography translator module for Hyperledger Fabric smart contracts.
        // it returns an object with the following fields:
        //      object.chorID
        //      object.roles
        //      object.configTxProfile
        //      object.startEvent
        //      object.modelName
        //      object.contract (the translated contract code)
        //      object.contractName

        const obj = await new ChorTranslator(chorxml)

        res.json({ response: obj })
    } catch (err) {
        console.log(err)
        res.json({ error: err.message || err.toString() })
    }
})

router.post('/deploy', async (req, res) => {
    try {
        const { idChor, contractVersion } = req.body

        let chorinstance = await ChorInstance.findOne({ idChor: idChor }).exec()
        const configTxProfile = chorinstance.configTxProfile
        const contractName = chorinstance.contractName
        const channel = chorinstance.channel
        const cVersion = contractVersion || 1

        highlightLog(`Generating Channel Transaction for: ${channel}`)
        await ChannelU.generateChannelTransaction(channel, configTxProfile)

        for(let i = 1; i <= 3; i++) {
            highlightLog(`Generating Anchor Peer Transaction for Org${i}`)
            await ChannelU.generateAnchorPeerTransaction(channel, configTxProfile, `Org${i}MSP`)
        }
        
        highlightLog(`Join Peer Org1`)
        const client = await ChannelU.createClient('org1.example.com', 'Org1MSP', 'connection-org1.yaml')
        await ChannelU.createChannel(client, channel)
        await ChannelU.joinChannel(client, channel, 'org1.example.com', 'grpcs://localhost:7051')

        highlightLog(`Join Peer Org2`)
        const client2 = await ChannelU.createClient('org2.example.com', 'Org2MSP', 'connection-org2.yaml')
        await ChannelU.joinChannel(client2, channel, 'org2.example.com', 'grpcs://localhost:9051')

        highlightLog(`Join Peer Org3`)
        const client3 = await ChannelU.createClient('org3.example.com', 'Org3MSP', 'connection-org3.yaml')
        await ChannelU.joinChannel(client3, channel, 'org3.example.com', 'grpcs://localhost:11051')

        highlightLog(`Update Anchor Peers definition for: ${channel}`)
        await ChannelU.update3OrgsAnchorPeers(channel).catch(e => undefined) // skip this error

        highlightLog(`Deploying Contract: ${contractName}`)
        await ChannelU.deploy3OrgsContract(channel, cVersion)

        // MOVED TO API/FILE/UPLOAD API
        /*highlightLog(`Creating Choreography Instance on MongoDB - chor ID: ${idChor}`)
        const chor = await ChorInstance.create({
            idBpmnFile,
            bpmnFileName,
            startEvent,
            roles,
            configTxProfile,
            idChor,
            contractName,
            channel,
            contractVersion
        })*/

        // update choreography instance deployed field
        chorinstance.deployed = true
        await chorinstance.save()

        // res.json({ response: chor })
        res.json({ response: 'Contract successfully deployed!' })

    } catch (err) {
        console.log(err)
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router