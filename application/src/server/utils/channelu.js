const fs = require('fs')
const path = require('path')
const WalletU = require('../utils/walletu')
const CryptoPeerUser = require('../utils/cryptopeeruser')
const command = require('../utils/command')
const FabClient = require('fabric-client')

class ChannelU {
    constructor() {}

    /**
     * @param {String} channelName | name of the created channel (eg. mychannel)
     * @param {String} configTxProfile | the profile specified in configtx.yaml (eg. TwoOrgsChannel)
     * @param {String} idModel | id of choreography model
     */
    static async generateChannelTransaction(channelName, configTxProfile, idModel) {
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/channelTx.sh')
        const resp = await command.shExec(shFilePath, [channelName, configTxProfile, idModel])
        console.log('\n------- CREATE CHANNEL TX -------'); console.log(resp); console.log('\n')
    }

    /**
     * @param {String} channelName | name of the created channel (eg. mychannel)
     * @param {String} configTxProfile | the profile specified in configtx.yaml (eg. TwoOrgsChannel)
     * @param {String} orgMspID | organization msp ID (eg. Org1MSP)     
     */
    static async generateAnchorPeerTransaction(channelName, configTxProfile, orgMspID, idModel) {
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/anchorPeerTx.sh')
        const resp = await command.shExec(shFilePath, [channelName, configTxProfile, orgMspID, idModel])
        console.log('\n------- CREATE ANCHOR PEER TX -------'); console.log(resp); console.log('\n')
    }

    /**
     * 
     * @param {String} org | organization domain (eg. org1.example.com)
     * @param {String} orgMspID | organization msp ID (eg. Org1MSP)
     * @param {String} ccpFileName | connection profile name (eg. connection-org1.yaml)
     * @returns {Client} return the Client object
     */
    static async createClient(org, orgMspID, ccpFileName) {
        const connOrgPath = CryptoPeerUser.getConnectionProfilePath(org, ccpFileName)

        // Create identity
        const identityLabel = `Admin@${org}`;
        const walletPath = WalletU.getWalletPath(identityLabel)
        const cryptoUser = new CryptoPeerUser(org, `Admin@${org}`, 'cert.pem', 'priv_sk') // removed: Admin@${org}-cert.pem (cert file name)
        await WalletU.createIdentity(identityLabel, orgMspID, cryptoUser.certificate, cryptoUser.privateKey)

        let client = FabClient.loadFromConfig(connOrgPath)
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
     * @param {String} idModel | id of choreography model
     * @param {String} ordererUrl | grpcs orderer address (e.g. grpcs://localhost:7050)
     */
    static async createChannel(client, channelName, idModel, ordererUrl) {
        let envelope_bytes = fs.readFileSync(path.join(__dirname, `../../../../test-network/channel-artifacts/${channelName}.tx`))
        let config_update = client.extractChannelConfig(envelope_bytes)
        const signature = client.signChannelConfig(config_update)

        let resp = await client.createChannel({
            config: config_update, // the binary config
            signatures: [signature], // the collected signatures
            name: channelName,
            orderer: ChannelU.getOrderer(client, idModel, ordererUrl),
            txId: client.newTransactionID() // the generated transaction id
        })
        console.log('\n------- CREATE CHANNEL RESP -------'); console.log(resp); console.log('\n')
    }

    /**
     * @param {Client} client | the Client object returned by createClient method
     * @param {String} channelName | name of the created channel (eg. mychannel)
     * @param {String} org | organization domain (eg. org1.example.com)
     * @param {String} peerAddress | grpcs peer local address (eg. grpcs://localhost:7051) 
     * @param {String} peerTlsCACert | tls ca cert from connection profile
     * @param {String} idModel | id of choreography model
     * @param {String} ordererUrl | grpcs orderer address (e.g. grpcs://localhost:7050)
     */
    static async joinChannel(client, channelName, org, peerAddress, peerTlsCACert, idModel, ordererUrl) {
        const channel = client.newChannel(channelName)
        const orderer = ChannelU.getOrderer(client, idModel, ordererUrl)
        channel.addOrderer(orderer)

        // get mychannel.block genesis block
        const genesis_block = await channel.getGenesisBlock({ 
            txId: client.newTransactionID(), 
            orderer: orderer 
        })

        // Join peer0 to mychannel
        const peerOrgID = `peer0.${org}`
        // const peerOrgTlsCert = CryptoPeerUser.getPeerOrgTlsCert(org, peerOrgID, `tlsca.${org}-cert.pem`)
        const peerOrg = client.newPeer(peerAddress, {
            // pem: peerOrgTlsCert,
            pem: peerTlsCACert,
            'ssl-target-name-override': peerOrgID
        })
        channel.addPeer(peerOrg)

        const resp = await channel.joinChannel({
            targets : [peerOrg],
            block : genesis_block,
            txId : 	client.newTransactionID()
        })
        console.log(`\n ------ JOIN CHANNEL RESP: ${peerOrgID} -------`); console.log(resp); console.log('\n')
    }

    /**
     * @param {String} channelName | name of the created channel (eg. mychannel)
     * @param {Number} orgCounter | organization counter
     * @param {String} idModel | id of choreography model
     * @param {String} ordererAddress | orderer address (eg. localhost:7050)
     */
    static async updateOrgAnchorPeer(channelName, orgCounter, idModel, ordererAddress) {
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/updateOrgAnchorPeer.sh')
        const resp = await command.shExec(shFilePath, [channelName, orgCounter, idModel, ordererAddress])
        console.log(`\n------- UPDATE org${orgCounter}.${idModel}.com ANCHOR PEER -------`); console.log(resp); console.log('\n')
    }

    /**
     * 
     * @param {Client} client | the Client object returned by createClient method
     * @param {String} idModel | id of choreography model
     * @param {String} ordererUrl | grpcs orderer address (e.g. grpcs://localhost:7050)
     */
    static getOrderer(client, idModel, ordererUrl) {
        const ordererDir = `${idModel}.com`
        const ordererID = `orderer.${idModel}.com`
        const tlsCa = `tlsca.${idModel}.com-cert.pem`

        const ordererTlsCert = CryptoPeerUser.getOrdererTlsCert(ordererDir, ordererID, tlsCa)
        const orderer = client.newOrderer(ordererUrl, {
            pem: ordererTlsCert,
            'ssl-target-name-override': ordererID
        })

        return orderer
    }

    /**
     * @param {String} channelName | name of the channel (eg. mychannel)
     * @param {Number} version | the version of the contract (eg. 1)
     * @param {Number} firstOrgNum | the first org number (eg. if Org1 then this value should be 1)
     * @param {Number} secondOrgNum | the second org number (e.g. if Org3 then this value should be 3)
     */
    static async deployContract(channelName, version, firstOrgNum, secondOrgNum) {
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/deployC.sh')
        const resp = await command.shExec(shFilePath, [channelName, version, firstOrgNum, secondOrgNum])
        console.log('\n------- DEPLOY CONTRACT SCRIPT -------'); console.log(resp); console.log('\n')
    }

    /**
     * @param {String} channelName | name of the channel (eg. mychannel)
     * @param {String} contractName | smart contract name
     * @param {Number} version | the version of the contract (eg. 1)
     */
    static async deploy3OrgsContract(channelName, contractName, version) {
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/deploy3OrgsC.sh')
        const resp = await command.shExec(shFilePath, [channelName, contractName, version])
        console.log('\n------- DEPLOY 3 ORGS CONTRACT SCRIPT -------'); console.log(resp); console.log('\n')
    }

    /**
     * 
     * @param {String} channelName | name of the channel (eg. mychannel)
     * @param {String} contractName | smart contract name
     * @param {Number} version | the version of the contract (eg. 1)
     * @param {JSON} collectionsPolicy | policy for private data collection (see collections_config.json file)
     * @param {String} idModel | id of choreography model
     * @param {Number} numOrgs | number of choreography participants
     * @param {String} ordererAddress | orderer address (eg. localhost:7050)
     */
    static async deployOrgsContract(channelName, contractName, version, collectionsPolicy, idModel, numOrgs, ordererAddress) {
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/deployOrgsC.sh')
        const resp = await command.shExec(shFilePath, [channelName, contractName, version, collectionsPolicy, idModel, numOrgs, ordererAddress])
        console.log('\n------- DEPLOY ORGS CONTRACT SCRIPT -------'); console.log(resp); console.log('\n')
    }

    /**
     * @param {String} contractName | smart contract name
     * @param {String} idModel | id of choreography model
     * @param {Number} version | the version of the contract (eg. 1)
     */
    static async packageChaincode(contractName, idModel, version) {
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/packageC.sh')
        const resp = await command.shExec(shFilePath, [contractName, idModel, version])
        console.log('\n------- PACKAGE CHAINCODE SCRIPT -------'); console.log(resp); console.log('\n')
    }

}

module.exports = ChannelU
