'use strict'
const { logger } = require('../utils/logger');

class ChoreographyPrivateState {
    constructor(obj) {
        Object.assign(this, obj);
    }

    async updatePrivateState(ctx, collection) {
        const transientMap = ctx.stub.getTransient();

        const obj =  this.mapToObj(transientMap);
        logger.log('info', 'Transient Map Data: ');
        logger.log('info', obj);
        logger.log('info', obj.data);
        logger.log('info', obj.data.toString('utf8'));

        const json = JSON.parse(obj.data.toString('utf8'));
        Object.assign(this, json);
        logger.log('info', 'Data Object: ' + JSON.stringify(this));

        await ctx.stub.putPrivateData(collection, this.chorID, this.serialize(this));
    }

    static async getPrivateState(ctx, collection, chorID) {
        const data = await ctx.stub.getPrivateData(collection, chorID);
        let object = null;

        logger.log('info', 'Choreography Buffer: ' + data);

        if(data && data.toString('utf8')) {
            let json = JSON.parse(data.toString());
            object = new (ChoreographyPrivateState)(json);
        } else {
            object = new (ChoreographyPrivateState)({ chorID });
        }

        return object;
    }

    serialize(object) {
        return Buffer.from(JSON.stringify(object));
    }

    mapToObj(m) {
        return Array.from(m).reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    }
}

module.exports = {
    ChoreographyPrivateState
}
