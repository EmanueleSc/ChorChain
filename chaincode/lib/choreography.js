'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

const Status = {
    DISABLED: 'disabled',
    ENABLED: 'enabled',
    DONE: 'done'
}

class Choreography extends State {

    constructor(obj) {
        super(Choreography.getClass(), [obj.issuer, obj.chorID]);
        this.elements = {}
        for (const [, elem] of obj.chorElements.entries()) {
            elements[elem] = Status.DISABLED
        }
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
     * @param {String} issuer Choreography model issuer
     * @param {String} chorID Choreography identifier (e.g. UUID)
     * @param {String[]} chorElements Array of Choreography elements id
     */
    static createInstance(issuer, chorID, chorElements /*, TODO ... */) {
        return new Choreography({ issuer, chorID, chorElements /*, TODO ... */ });
    }

    static getClass() {
        return 'org.chorchain.choreography';
    }
}

module.exports = Choreography;