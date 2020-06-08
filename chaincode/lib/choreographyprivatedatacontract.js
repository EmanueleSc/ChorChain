'use strict';

const { Contract } = require('fabric-contract-api');
const { logger } = require('../utils/logger');
const { ChoreographyState, Status } = require('../ledger-api/choreographystate');
const { ChoreographyPrivateState } = require('../ledger-api/choreographyprivatestate')

const chorID = 'CHOR1';
const contractName = 'org.chorchain.choreographyprivatedata_1';
const chorElements = [
    'Event_0tttznh',
    'Gateway_0c09rfi',
    'Message_11j40xz',
    'Message_0tn8489'
];
const roles = { Customer: 'Org1MSP', Bike_center: 'Org2MSP', Insurer: 'Org3MSP' };

// collection combination with 3 orgs: Org1 - Org2 , Org1 - Org3 , Org2 - Org3
const collectionsPrivate = {
    CustomerBike_center: 'collection' + roles.Customer + roles.Bike_center,
    CustomerInsurer: 'collection' + roles.Customer + roles.Insurer,
    Bike_centerInsurer: 'collection' + roles.Bike_center + roles.Insurer
};

class ChoreographyPrivateDataContract extends Contract {

    constructor() {
        super(contractName);
    }

    async instantiate(ctx) {
        logger.log('info', '==== INSTANTIATE THE CONTRACT');

        const choreography = new ChoreographyState({ chorID });
        choreography.initElements(chorElements);
        choreography.setEnable('Event_0tttznh');
        await choreography.updateState(ctx);

        logger.log('info', 'Choreography init state:');
        logger.log('info', choreography);

        return choreography;
    }

    async Event_0tttznh(ctx) {
        logger.log('info', '==== Event_0tttznh CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        if(choreography.elements.Event_0tttznh === Status.ENABLED) {
            choreography.setDone('Event_0tttznh');
            choreography.setEnable('Gateway_0c09rfi');
            await choreography.updateState(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return choreography;
        } else {
            throw new Error('Event_0tttznh is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

    async Gateway_0c09rfi(ctx) {
        logger.log('info', '==== Gateway_0c09rfi CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        if(choreography.elements.Gateway_0c09rfi === Status.ENABLED) {
            choreography.setDone('Gateway_0c09rfi');
            choreography.setEnable('Message_11j40xz');
            await choreography.updateState(ctx);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return choreography;
        } else {
            throw new Error('Gateway_0c09rfi is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }


    async Message_11j40xz(ctx) {
        logger.log('info', '==== Message_11j40xz CALLED');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx, chorID);

        logger.log('info', 'MspID SENDER TX');
        logger.log('info', ctx.stub.getCreator().mspid);

        if(choreography.elements.Message_11j40xz === Status.ENABLED && roles.Customer === ctx.stub.getCreator().mspid) {
            const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.CustomerBike_center, chorID);
            choreography.setDone('Message_11j40xz');
            await choreography.updateState(ctx);
            await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.CustomerBike_center);

            logger.log('info', 'Choreography:');
            logger.log('info', choreography);

            return { choreography, choreographyPrivate };
        } else {
            throw new Error('Message_11j40xz is not ENABLED. Current state = ' + JSON.stringify(choreography));
        }
    }

}

module.exports = ChoreographyPrivateDataContract;
