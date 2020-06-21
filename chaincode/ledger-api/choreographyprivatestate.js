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

        Object.assign(this, obj);
        logger.log('info', 'Data Object: ' + JSON.stringify(this));

        await ctx.stub.putPrivateData(collection, this.chorID, this.serialize(this));
    }

    static async getPrivateState(ctx, collection, chorID) {
        logger.log('info', 'Collection ' + collection);
        logger.log('info', 'ChorID ' + chorID);

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
            const v = value.toString('utf8');
            if(isNaN(v)) {
                if(v == "true" || v == "false") obj[key] = JSON.parse(v);
                else obj[key] = v;
            } else {
                obj[key] = JSON.parse(v);
            }
            return obj;
        }, {});
    }
}

module.exports = {
    ChoreographyPrivateState
}
