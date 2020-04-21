'use strict';

// Fabric smart contract classes
const { Contract } = require('fabric-contract-api');

const Status = {
    DISABLED: 'disabled',
    ENABLED: 'enabled',
    DONE: 'done'
}

class ChoreographyState {
    constructor() {
        this.chorID = 'CHOR1';
        this.chorElements = ['StartEvent', 'ExclusiveGateway', 'Message', 'EndEvent'];
        this.elements = {};
        for (const [, elem] of this.chorElements.entries()) {
            this.elements[elem] = Status.DISABLED
        }
    }
}

class ChoreographyContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.chorchain.choreography');
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        console.log('===================== Instantiate the contract =====================');

        const choreography = new ChoreographyState();
        console.log('===================== Choreography =====================');
        console.log(choreography);

        await ctx.stub.putState(choreography.chorID, Buffer.from(JSON.stringify(choreography)));
    }

    async queryChor(ctx, chorID) {
        console.log('===================== QueryChor start =====================');
        console.log('===================== Choreography ID =====================');
        console.log(chorID);

        const chor = await ctx.stub.getState(chorID);

        console.log('===================== Choreography Buffer =====================');
        console.log(chor);

        if (chor && chor.toString('utf8')) {
            const json = JSON.parse(chor.toString());

            console.log('===================== Choreography Query Json =====================');
            console.log(json)

            return json;
        }

        return null;
    }

}

module.exports = ChoreographyContract;
