'use strict';

// Fabric smart contract classes
const { Contract } = require('fabric-contract-api');
const { logger } = require('../utils/logger');
const { ChoreographyState, Status } = require('../ledger-api/choreographystate');

const chorID = 'CHOR1'; // Key of the choreography ledger state (must be unique)
const contractName = 'org.chorchain.choreography_1'; // name of this smartcontract (must be unique)
const chorElements = [
    'StartEvent_00yy9i8',
    'Message_1pam53q',
    'ExclusiveGateway_0zotmga'
];

class ChoreographyContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super(contractName);
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        logger.log('info', '==== INSTANTIATE THE CONTRACT');

        const choreography = new ChoreographyState({ chorID });
        choreography.initElements(chorElements);
        await choreography.setEnable(ctx, 'StartEvent_00yy9i8');

        logger.log('info', 'Choreography init state:');
        logger.log('info', choreography);

        // await this.StartEvent_00yy9i8(ctx);
        return choreography;
    }

    async StartEvent_00yy9i8(ctx) {
        logger.log('info', '==== STARTEVENT_00yy9i8 CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        if(choreography.elements.StartEvent_00yy9i8 === Status.ENABLED) {
            await choreography.setDone(ctx, 'StartEvent_00yy9i8');
            await choreography.setEnable(ctx, 'Message_1pam53q');

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return choreography;
        } else {
            throw new Error('StartEvent_00yy9i8 is not ENABLED. Current state = ' + choreography);
        }
    }

    async Message_1pam53q(ctx, product) {
        logger.log('info', '==== MESSAGGE_1pam53q CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        if(choreography.elements.Message_1pam53q === Status.ENABLED) {
            await choreography.setDone(ctx, 'Message_1pam53q');
            await choreography.updateState(ctx, { product });
            await choreography.setEnable(ctx, 'ExclusiveGateway_0zotmga');
            // this.ExclusiveGateway_0zotmga(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return choreography;
        } else {
            throw new Error('Message_1pam53q is not ENABLED. Current state = ' + choreography);
        }
    }

    async ExclusiveGateway_0zotmga(ctx) {
        logger.log('info', '==== EXCLUSIVEGATEWAY_0zotmga CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        if(choreography.elements.ExclusiveGateway_0zotmga === Status.ENABLED) {
            await choreography.setDone(ctx, 'ExclusiveGateway_0zotmga');
            // TODO: enable next element

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return choreography;
        } else {
            throw new Error('ExclusiveGateway_0zotmga is not ENABLED. Current state = ' + choreography);
        }
    }

}

module.exports = ChoreographyContract;
