'use strict'
const { logger } = require('../utils/logger');
const Status = { DISABLED: 'disabled', ENABLED: 'enabled', DONE: 'done' };

class ChoreographyState {
    constructor(obj) {
        Object.assign(this, obj);
    }

    /**
     * Inizialize the elements object that maps choreography elements
     * to their Status { disabled, enabled, done }.
     * elements object is included in ledger state of a choreography.
     * @param {String[]} chorElements | array of choreography elements ID
     */
    initElements(chorElements) {
        this.elements = {};
        for (const [, elem] of chorElements.entries()) {
            this.elements[elem] = Status.DISABLED;
        }
    }

    async setEnable(ctx, taskID) {
        this.elements[taskID] = Status.ENABLED;
        await ctx.stub.putState(this.chorID, this.serialize(this));
    }

    async setDisable(ctx, taskID) {
        this.elements[taskID] = Status.DISABLED;
        await ctx.stub.putState(this.chorID, this.serialize(this));
    }

    async setDone(ctx, taskID) {
        this.elements[taskID] = Status.DONE;
        await ctx.stub.putState(this.chorID, this.serialize(this));
    }

    static async getState(ctx, chorID) {
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

module.exports = ChoreographyState;
