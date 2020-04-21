'use strict';

// Fabric smart contract classes
const { Contract } = require('fabric-contract-api');
const { logger } = require('../utils/logger');

const chorID = 'CHOR1'; // Key of the choreography ledger state (must be unique)
const smartContractName = 'org.chorchain.choreography'; // Name of this smartcontract (must be unique)
const chorElements = ['StartEvent', 'ExclusiveGateway', 'Message', 'EndEvent'];
const Status = { DISABLED: 'disabled', ENABLED: 'enabled', DONE: 'done' };

class ChoreographyState {
    constructor(obj) {
        Object.assign(this, obj);
    }

    initElements() {
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

    static async getState(ctx) {
        const data = await ctx.stub.getState(chorID);
        let object = null;

        logger.log('info', 'Choreography Buffer');
        logger.log('info', data);

        if(data && data.toString('utf8')) {
            let json = JSON.parse(data.toString());
            object = new (ChoreographyState)(json);
        }

        logger.log('info', 'Choreography Object');
        logger.log('info', object);

        return object;
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

        const choreography = new ChoreographyState({ chorID });
        choreography.initElements();
        await choreography.setEnable(ctx, 'StartEvent');
    }

    async queryChor(ctx) {
        logger.log('info', 'QueryChor start');
        logger.log('info', 'Choreography ID: ' + chorID);

        const choreography = await ChoreographyState.getState(ctx);
        return choreography;
    }

}

module.exports = ChoreographyContract;
