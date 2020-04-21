'use strict';

// Fabric smart contract classes
const { Contract } = require('fabric-contract-api');
const { logger } = require('../utils/logger');

const chorID = 'CHOR1'; // Key of the choreography ledger state (must be unique)
const smartContractName = 'org.chorchain.choreography'; // Name of this smartcontract (must be unique)
const chorElements = ['StartEvent', 'ExclusiveGateway', 'Message', 'EndEvent'];
const Status = { DISABLED: 'disabled', ENABLED: 'enabled', DONE: 'done' };

class ChoreographyState {
    constructor() {
        this.choreographyID = chorID;
        this.initElements(chorElements);
    }

    initElements(chorElements) {
        this.elements = {};
        for (const [, elem] of chorElements.entries()) {
            this.elements[elem] = Status.DISABLED;
        }
    }

    async setEnable(ctx, taskID) {
        this.elements[taskID] = Status.ENABLED;
        await ctx.stub.putState(chorID, this.serialize(this));
    }

    async setDisable(ctx, taskID) {
        this.elements[taskID] = Status.DISABLED;
        await ctx.stub.putState(chorID, this.serialize(this));
    }

    async setDone(ctx, taskID) {
        this.elements[taskID] = Status.DONE;
        await ctx.stub.putState(chorID, this.serialize(this));
    }

    static async getBufferState(ctx) {
        const chor = await ctx.stub.getState(chorID);
        return chor;
    }

    static async getDeserializedState(ctx) {
        const chor = await ctx.stub.getState(chorID);
        let json = null;

        logger.log('info', 'Choreography Buffer');
        logger.log('info', chor);

        if (chor && chor.toString('utf8')) {
            json = JSON.parse(chor.toString());
        }

        logger.log('info', 'Choreography Query Json');
        logger.log('info', json);

        return json;
    }

    serialize(object) {
        return Buffer.from(JSON.stringify(object));
    }
}

class ChoreographyContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super(smartContractName);
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        logger.log('info', 'Instantiate the contract');

        const choreography = new ChoreographyState();
        await choreography.setEnable(ctx, 'StartEvent');
    }

    async queryChor(ctx) {
        logger.log('info', 'QueryChor start');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getDeserializedState(ctx);
        return choreography;
    }

}

module.exports = ChoreographyContract;
