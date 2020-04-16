'use strict';

// const ChorChaincode = require('../lib/choreographycontract');
const Choreography = require('../lib/choreography');
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const path = require('path');

// Global variables
const fixtures = path.resolve(__dirname, '../../test-network');
const identityLabel = 'isabella';
let wallet, gateway, network, contract, chor;

require('chai').should();

describe('Chaincode', () => {
    describe('Add new identity to Wallet', () => {

        it('should work', async () => {
            wallet = await Wallets.newFileSystemWallet(`./identity/user/${identityLabel}/wallet`);

            const userExists = await wallet.get(identityLabel);
            if (userExists) {
                console.log(`An identity for the client user "${identityLabel}" already exists in the wallet`);
                return;
            }

            const credPath = path.join(fixtures, '/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com');
            const certificate = fs.readFileSync(path.join(credPath, '/msp/signcerts/User1@org1.example.com-cert.pem')).toString();
            const privateKey = fs.readFileSync(path.join(credPath, '/msp/keystore/priv_sk')).toString();

            const identity = {
                credentials: { certificate, privateKey },
                mspId: 'Org1MSP',
                type: 'X.509'
            }

            await wallet.put(identityLabel, identity);
        });

    });

    describe('Create and connect to Gateway', () => {

        it('should work', async () => {
            gateway = new Gateway();
            const connOrg1Path = path.join(fixtures, '/organizations/peerOrganizations/org1.example.com/connection-org1.yaml');
            let connectionProfile = yaml.safeLoad(fs.readFileSync(connOrg1Path, 'utf8'));
            let connectionOptions = {
                identity: identityLabel,
                wallet: wallet,
                discovery: { enabled: true, asLocalhost: true },
                eventHandlerOptions: {
                    strategy: null // Cause transaction invocations to return immediately after successfully sending the endorsed transaction to the orderer
                }
            };
            await gateway.connect(connectionProfile, connectionOptions);
        });

    });

    describe('Access the Network channel mychannel and get the Choreography Contract', () => {

        it('should work', async () => {
            network = await gateway.getNetwork('mychannel');
            contract = await network.getContract('choreographycontract', 'org.chorchain.choreography');
        });

    });

    describe('Submit createChor transaction', () => {

        it('should work', async () => {
            const resp = await contract.submitTransaction('createChor');
            chor = Choreography.fromBuffer(resp);
        });

    });

    describe('Submit queryChor transaction', () => {

        it('should work', async () => {
            const resp = await contract.submitTransaction('queryChor', chor.issuer, chor.chorID);
            console.log(resp);
        });

    });

    describe('Submit updateChor transaction', () => {

        it('should work', async () => {
            const resp = await contract.submitTransaction('updateChor', chor.issuer, chor.chorID);
            console.log(resp);
        });

    });

});
