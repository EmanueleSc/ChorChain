const fs = require('fs')
const path = require('path')
const WalletU = require('../utils/walletu')
const CryptoPeerUser = require('../utils/cryptopeeruser')
const FabClient = require('fabric-client')

class ChannelU {
    constructor() {}

    /**
     * 
     * @param {String} org | organization domain (eg. org1.example.com)
     * @param {String} orgMspID | organization msp ID (eg. Org1MSP)
     * @param {String} ccpFileName | connection profile name (eg. connection-org1.yaml)
     * @returns {Client} return the Client object
     */
    static async createClient(org, orgMspID, ccpFileName) {
        const connOrg1Path = CryptoPeerUser.getConnectionProfilePath(org, ccpFileName)

        // Create identity
        const identityLabel = 'admin';
        const walletPath = WalletU.getWalletPath(identityLabel)
        const cryptoUser = new CryptoPeerUser(org, `Admin@${org}`, `Admin@${org}-cert.pem`, 'priv_sk')
        await WalletU.createIdentity(identityLabel, orgMspID, cryptoUser.certificate, cryptoUser.privateKey)

        let client = FabClient.loadFromConfig(connOrg1Path)
        let kvs = await FabClient.newDefaultKeyValueStore({ path: walletPath })
        await client.setStateStore(kvs)

        await client.createUser({
            username: identityLabel,
            mspid: orgMspID,
            cryptoContent: {
                privateKeyPEM: cryptoUser.privateKey,
                signedCertPEM: cryptoUser.certificate
            }
        })

        return client
    }

    /**
     * @param {Client} client | the Client object returned by createClient method
     * @param {String} channelName | name of the created channel (eg. mychannel)
     */
    static async createChannel(client, channelName) {
        let envelope_bytes = fs.readFileSync(path.join(__dirname, `../../../../test-network/channel-artifacts/${channelName}.tx`))
        let config_update = client.extractChannelConfig(envelope_bytes)
        const signature = client.signChannelConfig(config_update)

        let resp = await client.createChannel({
            config: config_update, // the binary config
            signatures: [signature], // the collected signatures
            name: channelName,
            orderer: ChannelU.getOrderer(client),
            txId: client.newTransactionID() // the generated transaction id
        })
        console.log('\n------- CREATE CHANNEL RESP -------'); console.log(resp); console.log('\n')
    }

    /**
     * @param {Client} client | the Client object returned by createClient method
     * @param {String} channelName | name of the created channel (eg. mychannel)
     * @param {String} org | organization domain (eg. org1.example.com)
     */
    static async joinChannel(client, channelName, org) {
        const channel = client.newChannel(channelName)
        const orderer = ChannelU.getOrderer(client)
        channel.addOrderer(orderer)

        // get mychannel.block genesis block
        const genesis_block = await channel.getGenesisBlock({ 
            txId: client.newTransactionID(), 
            orderer: orderer 
        })

        // Join peer0 Org1 to mychannel
        const peerOrgID = `peer0.${org}`
        const peerOrgTlsCert = CryptoPeerUser.getPeerOrgTlsCert(org, peerOrgID, `tlsca.${org}-cert.pem`)
        const peerOrg = client.newPeer('grpcs://localhost:7051', {
            pem: peerOrgTlsCert,
            'ssl-target-name-override': peerOrgID
        })
        channel.addPeer(peerOrg)

        resp = await channel.joinChannel({
            targets : [peerOrg],
            block : genesis_block,
            txId : 	client.newTransactionID()
        })
        console.log(`\n ------ JOIN CHANNEL: ${peerOrgID} RESP -------`); console.log(resp); console.log('\n')
    }

    static getOrderer(client) {
        const ordererID = 'orderer.example.com'
        const ordererTlsCert = CryptoPeerUser.getOrdererTlsCert('example.com', ordererID, 'tlsca.example.com-cert.pem')
        const orderer = client.newOrderer('grpcs://localhost:7050', {
            pem: ordererTlsCert,
            'ssl-target-name-override': ordererID
        })
        return orderer
    }

}

module.exports = ChannelU
