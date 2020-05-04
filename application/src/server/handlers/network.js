import express from "express";
const router = express.Router();

const { Wallets, Gateway, DefaultEventHandlerStrategies } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const fixtures = path.resolve(__dirname, '../../../../test-network');
const { v4: uuidv4 } = require('uuid');

router.get('/create/org1/identity', async (req, res) => {
    try {
        const identityLabel = 'isabella';
        const walletPath = path.resolve(__dirname, `../../../identity/user/${identityLabel}/wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        const userExists = await wallet.get(identityLabel);
        if (userExists) {
            console.log(`An identity for the client user "${identityLabel}" already exists in the wallet`);
            return res.json({ response: `An identity for the client user "${identityLabel}" already exists in the wallet` });
        }

        const credPath = path.join(fixtures, process.env.ORG1_USER1);
        const certificate = fs.readFileSync(path.join(credPath, process.env.MSP_CERT_USER1)).toString();
        const privateKey = fs.readFileSync(path.join(credPath, process.env.MSP_PRIV_KEY)).toString();

        const identity = {
            credentials: { certificate, privateKey },
            mspId: 'Org1MSP',
            type: 'X.509'
        }

        await wallet.put(identityLabel, identity);
        res.json({ response: `Identity for the client user "${identityLabel}" created!` });

    } catch (err) {
        res.json({ error: err.message || err.toString() });
    }
});

router.get('/create/org1/connection', async (req, res) => {
    try {
        const identityLabel = 'isabella';
        const walletPath = path.resolve(__dirname, `../../../identity/user/${identityLabel}/wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const connOrg1Path = path.join(fixtures, process.env.ORG1_CONN_PROFILE);
        let connectionProfile = yaml.safeLoad(fs.readFileSync(connOrg1Path, 'utf8'));
        let connectionOptions = {
            identity: identityLabel,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                // if strategy set to null, it will not wait for any commit events to be received from peers
                // https://hyperledger.github.io/fabric-sdk-node/release-1.4/module-fabric-network.html#.DefaultEventHandlerStrategies
                strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX
            }
        };

        const connectionID = uuidv4();
        // save connection profile and option in global object 
        global.ConnectionProfiles[connectionID] = { connectionProfile, connectionOptions };

        res.json({ response: connectionID }); // return the ID of the connection

    } catch (err) {
        res.json({ error: err.message || err.toString() });
    }
});

router.post('/submit/transaction', async (req, res) => {
    try {
        const { connectionID, channel, contractNamespace, contractName, transactionName, transactionParams } = req.body;
        const gateway = new Gateway();
        const conn = global.ConnectionProfiles[connectionID];
        await gateway.connect(conn.connectionProfile, conn.connectionOptions);

        const network = await gateway.getNetwork(channel);
        const contract = await network.getContract(contractNamespace, contractName);
        let resp = null

        if(!transactionParams || transactionParams === '')
            resp = await contract.submitTransaction(transactionName);
        else
            resp = await contract.submitTransaction(transactionName, transactionParams);
        
        gateway.disconnect();
        res.json({ response: resp });

    } catch (err) {
        res.json({ error: err.message || err.toString() });
    }
});

module.exports = router;