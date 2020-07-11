import express from "express"
const router = express.Router()
const ChorInstance = require("../../db/chorinstance")
const ChannelU = require("../utils/channelu")

const highlightLog = (message) => {
    console.log(`#####################################################`)
    console.log(`#################### ${message} #####################`)
    console.log(`#####################################################`)

}

router.post('/deploy/contract', async (req, res) => {
    try {
        const { idBpmnFile, bpmnFileName, startEvent, roles, configTxProfile, idChor } = req.body
        const contractName = `org.hyreochain.choreographyprivatedata_${idChor}`
        const channel = `channel${idChor}`
        const contractVersion = 1

        highlightLog(`Creating Choreography Instance on MongoDB - chor ID: ${idChor}`)
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
        })

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
        await ChannelU.update3OrgsAnchorPeers(channel)

        highlightLog(`Deploying Contract: ${contractName}`)
        await ChannelU.deploy3OrgsContract(channel, contractVersion)

        res.json({ response: chor })
    } catch (err) {
        console.log(err)
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router