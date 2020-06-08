'use strict'
const { logger } = require('../utils/logger');

class ChoreographyPrivateState {
    constructor(obj) {
        Object.assign(this, obj);
    }

    async updatePrivateState(ctx, collection) {
        const transientMap = ctx.stub.getTransient();

        logger.log('info', 'Transient Map: ' + transientMap);

        const data = this.transientMapToBuffer(transientMap);
        const json =  JSON.parse(data.toString());
        Object.assign(this, json);

        logger.log('info', 'Data Object: ' + this);

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

    transientMapToBuffer(transientMap) {
        // convert into buffer
        return new Buffer(transientMap.map.conversation.value.toArrayBuffer());
    }
}

module.exports = {
    ChoreographyPrivateState
}
