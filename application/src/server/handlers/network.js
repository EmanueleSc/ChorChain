import express from "express";
const router = express.Router();

const { Wallets, Gateway, DefaultEventHandlerStrategies } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const fixtures = path.resolve(__dirname, '../../../../test-network');

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

router.get('/create/org1/gateway', async (req, res) => {
    try {
        const identityLabel = 'isabella';
        const walletPath = path.resolve(__dirname, `../../../identity/user/${identityLabel}/wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // const gateway = new Gateway();
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
        // await gateway.connect(connectionProfile, connectionOptions);
        console.log({ connectionProfile, connectionOptions })
        // res.json({ response: {} });

    } catch (err) {
        res.json({ error: err.message || err.toString() });
    }
});

module.exports = router;