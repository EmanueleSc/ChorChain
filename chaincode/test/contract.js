'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway, DefaultEventHandlerStrategies } = require('fabric-network');
const path = require('path');

// Global variables
const fixtures = path.resolve(__dirname, '../../test-network');
const identityLabel = 'isabella';
let wallet, gateway, network, contract;

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
                    // if strategy set to null, it will not wait for any commit events to be received from peers
                    // https://hyperledger.github.io/fabric-sdk-node/release-1.4/module-fabric-network.html#.DefaultEventHandlerStrategies
                    strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
                }
            };
            await gateway.connect(connectionProfile, connectionOptions);
        });

    });

    describe('Access the Network channel mychannel and get the Choreography Contract', () => {

        it('should work', async () => {
            // network = await gateway.getNetwork('mychannel');
            // contract = await network.getContract('choreographycontract', 'org.chorchain.choreography_1');
            network = await gateway.getNetwork('channel123');
            contract = await network.getContract('choreographyprivatedatacontract', 'org.chorchain.choreographyprivatedata_1');
        });

    });

    describe('Submit Event_0tttznh transaction', () => {

        it('should work', async () => {
            const resp = await contract.submitTransaction('Event_0tttznh');
            console.log(resp.toString());
        });

    });

    /* describe('Submit StartEvent_00yy9i8 transaction', () => {

        it('should work', async () => {
            const resp = await contract.submitTransaction('StartEvent_00yy9i8');
            console.log(resp.toString());
        });

    });

    describe('Submit Message_1pam53q transaction', () => {

        it('should work', async () => {
            const resp = await contract.submitTransaction('Message_1pam53q', 'pollo_fritto_con_patate');
            console.log(resp.toString());
        });

    });

    describe('Submit ExclusiveGateway_0zotmga transaction', () => {

        it('should work', async () => {
            const resp = await contract.submitTransaction('ExclusiveGateway_0zotmga');
            console.log(resp.toString());
        });

    }); */

});
