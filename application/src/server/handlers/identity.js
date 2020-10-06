import express from "express"
const router = express.Router()

const { DefaultEventHandlerStrategies } = require('fabric-network')
const WalletU = require('../utils/walletu')
const CryptoPeerUser = require('../utils/cryptopeeruser')
const fs = require('fs')
const yaml = require('js-yaml')
const { v4: uuidv4 } = require('uuid')

const OrgMspMap = {
    'Org1MSP': 'org1.example.com',
    'Org2MSP': 'org2.example.com',
    'Org3MSP': 'org3.example.com'
}
const connProfileMap = {
    'Org1MSP': 'connection-org1.yaml',
    'Org2MSP': 'connection-org2.yaml',
    'Org3MSP': 'connection-org3.yaml'
}

router.post('/create/user', async (req, res) => {
    try {
        const { OrgMspID } = req.body

        const org = OrgMspMap[OrgMspID]
        const identityLabel = `User1@${org}`

        const cryptoUser = new CryptoPeerUser(org, `User1@${org}`, `User1@${org}-cert.pem`, 'priv_sk')
        const wallet = await WalletU.createIdentity(identityLabel, OrgMspID, cryptoUser.certificate, cryptoUser.privateKey)
        
        const connProfileFile = connProfileMap[OrgMspID]
        const connProfilePath = CryptoPeerUser.getConnectionProfilePath(org, connProfileFile)
        const connectionProfile = yaml.safeLoad(fs.readFileSync(connProfilePath, 'utf8'))

        const connectionOptions = {
            identity: identityLabel,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                // if strategy set to null, it will not wait for any commit events to be received from peers
                // https://hyperledger.github.io/fabric-sdk-node/release-1.4/module-fabric-network.html#.DefaultEventHandlerStrategies
                strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX
            }
        }
        
        const connectionID = uuidv4()
        // save connection profile and option in global object 
        global.ConnectionProfiles[connectionID] = { connectionProfile, connectionOptions }
        // return the ID of the connection
        res.json({ response: connectionID })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router