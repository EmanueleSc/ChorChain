'use strict';

// Fabric smart contract classes
const { Contract } = require('fabric-contract-api');
const { logger } = require('../utils/logger');

const Status = {
    DISABLED: 'disabled',
    ENABLED: 'enabled',
    DONE: 'done'
}

class ChoreographyState {
    constructor() {
        this.chorID = 'CHOR1';
        this.chorElements = ['StartEvent', 'ExclusiveGateway', 'Message', 'EndEvent'];
        this.elements = {};
        for (const [, elem] of this.chorElements.entries()) {
            this.elements[elem] = Status.DISABLED
        }
    }
}

class ChoreographyContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.chorchain.choreography');
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        logger.log('info', 'Instantiate the contract');

        const choreography = new ChoreographyState();
        logger.log('info', 'Choreography');
        logger.log('info', choreography);

        await ctx.stub.putState(choreography.chorID, Buffer.from(JSON.stringify(choreography)));
    }

    async queryChor(ctx, chorID) {
        logger.log('info', 'QueryChor start');
        logger.log('info', 'Choreography ID: ' + chorID);

        const chor = await ctx.stub.getState(chorID);

        logger.log('info', 'Choreography Buffer');
        logger.log('info', chor);

        if (chor && chor.toString('utf8')) {
            const json = JSON.parse(chor.toString());

            logger.log('info', 'Choreography Query Json');
            logger.log('info', json);

            return json;
        }

        return null;
    }

}

module.exports = ChoreographyContract;
