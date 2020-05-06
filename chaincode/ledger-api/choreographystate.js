'use strict'
const Status = { DISABLED: 'disabled', ENABLED: 'enabled', DONE: 'done' };
const { logger } = require('../utils/logger');

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

    setEnable(taskID) {
        this.elements[taskID] = Status.ENABLED;
    }

    setDisable(taskID) {
        this.elements[taskID] = Status.DISABLED;
    }

    setDone(taskID) {
        this.elements[taskID] = Status.DONE;
    }

    async updateState(ctx, obj) {
        Object.assign(this, obj);
        await ctx.stub.putState(this.chorID, this.serialize(this));
    }

    static async getState(ctx, chorID) {
        const data = await ctx.stub.getState(chorID);
        let object = null;

        logger.log('info', 'Choreography Buffer: ' + data);

        if(data && data.toString('utf8')) {
            let json = JSON.parse(data.toString());
            object = new (ChoreographyState)(json);
        }

        return object;
    }

    serialize(object) {
        return Buffer.from(JSON.stringify(object));
    }
}

module.exports = {
    ChoreographyState,
    Status
}
