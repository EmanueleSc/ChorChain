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
        // Elements is the object that maps keys (choreography element id) with their status (disabled, enabled or done)
        this.elements = {}
        for (const [, elem] of obj.chorElements.entries()) {
            elements[elem] = Status.DISABLED
        }
        Object.assign(this, obj);
    }

    /**
     * Set to 'enabled' status a specific Choreography element referenced by his id
     * @param {String} elementID Choreography element id
     */
    enable(elementID) {
        this.elements[elementID] = Status.ENABLED
    }

    /**
     * Set to 'disabled' status a specific Choreography element referenced by his id
     * @param {String} elementID Choreography element id
     */
    disable(elementID) {
        this.elements[elementID] = Status.DISABLED
    }

    /**
     * Set to 'done' status a specific Choreography element referenced by his id
     * @param {String} elementID Choreography element id
     */
    done(elementID) {
        this.elements[elementID] = Status.DONE
    }

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