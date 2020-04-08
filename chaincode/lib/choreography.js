'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

class Choreography extends State {

    constructor(obj) {
        super(Choreography.getClass(), [obj.issuer, obj.chorNumber]);
        Object.assign(this, obj);
    }

    // TODO: common properties for a choreography to store in ledger state

    static fromBuffer(buffer) {
        return Choreography.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to choreography
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Choreography);
    }

    /**
     * Factory method to create a choreography object
     */
    static createInstance(issuer, chorNumber /*, TODO ... */) {
        return new Choreography({ issuer, chorNumber /*, TODO ... */ });
    }

    static getClass() {
        return 'org.chorchain.choreography';
    }
}

module.exports = Choreography;