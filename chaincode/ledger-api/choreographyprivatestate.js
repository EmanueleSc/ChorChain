'use strict'
const { logger } = require('../utils/logger');

class ChoreographyPrivateState {
    constructor(obj) {
        Object.assign(this, obj);
    }

    async updatePrivateState(ctx, collection, obj) {
        Object.assign(this, obj);
        await ctx.stub.putPrivateData(collection, this.chorID, this.serialize(this));
    }

    static async getPrivateState(ctx, collection, chorID) {
        const data = await ctx.stub.getPrivateData(collection, chorID);
        let object = null;

        logger.log('info', 'Choreography Buffer: ' + data);

        if(data && data.toString('utf8')) {
            let json = JSON.parse(data.toString());
            object = new (ChoreographyPrivateState)(json);
        }

        return object;
    }

    serialize(object) {
        return Buffer.from(JSON.stringify(object));
    }
}

module.exports = {
    ChoreographyPrivateState
}
