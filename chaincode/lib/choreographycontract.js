'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// Chorchain specifc classes
// const Choreography = require('./choreography.js');
const ChorList = require('./chorlist.js');

/**
 * A custom context provides easy access to list of all choreography models state
 */
class ChoreographyContext extends Context {

    constructor() {
        super();
        // All choreography models state are held in this list
        this.chorList = new ChorList(this);
    }

}

/**
 * Define choreography smart contract by extending Fabric Contract class
 *
 */
class ChoreographyContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.chorchain.choreography');
    }

    /**
     * Define a custom context for commercial paper
     */
    createContext() {
        return new ChoreographyContext();
    }

}

module.exports = ChoreographyContract;
