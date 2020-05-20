// const fs = require('fs')
// const path = require('path')
// const WalletU = require('../utils/walletu')
// const CryptoPeerUser = require('../utils/cryptopeeruser')
// const FabClient = require('fabric-client')
const ChannelU = require('../utils/channelu')

// Using ChannelU
const main = async () => {
    try {
        const channelName = 'mychannel'
        const configTxProfile = 'TwoOrgsChannel' // need to be specified in configtx.yaml file (test_network)
        await ChannelU.generateChannelTransaction(channelName, configTxProfile)

        const client = await ChannelU.createClient('org1.example.com', 'Org1MSP', 'connection-org1.yaml')
        await ChannelU.createChannel(client, channelName)
        await ChannelU.joinChannel(client, channelName, 'org1.example.com', 'grpcs://localhost:7051')

        const client2 = await ChannelU.createClient('org2.example.com', 'Org2MSP', 'connection-org2.yaml')
        await ChannelU.joinChannel(client2, channelName, 'org2.example.com', 'grpcs://localhost:9051')
        
    } catch (error) {
        console.log('\n ----- ERROR -----')
        console.log(error)
    }
}

// Not using ChannelU
/* const main = async () => {
    try {
        const channelName = 'mychannel'
        const connOrg1Path = CryptoPeerUser.getConnectionProfilePath('org1.example.com', 'connection-org1.yaml')

        // Create identity
        const identityLabel = 'admin';
        const msp_id = 'Org1MSP';
        const walletPath = WalletU.getWalletPath(identityLabel)
        const cryptoUser = new CryptoPeerUser('org1.example.com', 'Admin@org1.example.com', 'Admin@org1.example.com-cert.pem', 'priv_sk')
        await WalletU.createIdentity(identityLabel, msp_id, cryptoUser.certificate, cryptoUser.privateKey)
        
        
        let client = FabClient.loadFromConfig(connOrg1Path)
        let kvs = await FabClient.newDefaultKeyValueStore({ path: walletPath })
        await client.setStateStore(kvs)

        await client.createUser({
            username: identityLabel,
            mspid: msp_id,
            cryptoContent: {
                privateKeyPEM: cryptoUser.privateKey,
                signedCertPEM: cryptoUser.certificate
            }
        })
    
        let envelope_bytes = fs.readFileSync(path.join(__dirname, `../../../../test-network/channel-artifacts/${channelName}.tx`))
        let config_update = client.extractChannelConfig(envelope_bytes)
    
        const signature = client.signChannelConfig(config_update)

        const signatures = []
        signatures.push(signature)
        
        const ordererID = 'orderer.example.com'
        const ordererTlsCert = CryptoPeerUser.getOrdererTlsCert('example.com', ordererID, 'tlsca.example.com-cert.pem')
        const orderer = client.newOrderer('grpcs://localhost:7050', {
            pem: ordererTlsCert,
            'ssl-target-name-override': ordererID
        })

        const request = {
            config: config_update, //the binary config
            signatures : signatures, // the collected signatures
            name : channelName, // the channel name
            orderer : orderer, //the orderer from above
            txId  : client.newTransactionID() //the generated transaction id
        }

        let resp = await client.createChannel(request)
        console.log('\n------- CREATE CHANNEL RESP -------')
        console.log(resp)
        console.log('\n')

        const channel = client.newChannel(channelName)
        channel.addOrderer(orderer)

        // get mychannel.block genesis block
        const genesis_block = await channel.getGenesisBlock({ 
            txId: client.newTransactionID(), 
            orderer: orderer 
        })

        // Join peer0 Org1 to mychannel
        const peerOrg1ID = 'peer0.org1.example.com'
        const peerOrg1TlsCert = CryptoPeerUser.getPeerOrgTlsCert('org1.example.com', peerOrg1ID, 'tlsca.org1.example.com-cert.pem')
        const peerOrg1 = client.newPeer('grpcs://localhost:7051', {
            pem: peerOrg1TlsCert,
            'ssl-target-name-override': peerOrg1ID
        })
        channel.addPeer(peerOrg1)

        resp = await channel.joinChannel({
            targets : [peerOrg1],
            block : genesis_block,
            txId : 	client.newTransactionID()
        })
        console.log('\n ------ JOIN CHANNEL JOIN PEER0 ORG1 RESP -------')
        console.log(resp)
        console.log('\n')

        // Join peer0 Org2 to mychannel
        const peerOrg2ID = 'peer0.org2.example.com'
        const peerOrg2TlsCert = CryptoPeerUser.getPeerOrgTlsCert('org2.example.com', peerOrg2ID, 'tlsca.org2.example.com-cert.pem')
        const peerOrg2 = client.newPeer('grpcs://localhost:9051', {
            pem: peerOrg2TlsCert,
            'ssl-target-name-override': peerOrg2ID
        })
        channel.addPeer(peerOrg2)

        resp = await channel.joinChannel({
            targets : [peerOrg2],
            block : genesis_block,
            txId : 	client.newTransactionID()
        })
        console.log('\n ------ JOIN CHANNEL JOIN PEER0 ORG2 RESP -------')
        console.log(resp)
        console.log('\n')
        
    } catch (error) {
        console.log('\n ----- ERROR -----')
        console.log(error)
    }

} */

main()
