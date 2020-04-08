'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const Choreography = require('./choreography.js');

class ChorList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.chorchain.chorlist');
        this.use(Choreography);
    }

    async addChor(choreography) {
        return this.addState(choreography);
    }

    async getChor(choreographyKey) {
        return this.getState(choreographyKey);
    }

    async updateChor(choreography) {
        return this.updateState(choreography);
    }
}


module.exports = ChorList;