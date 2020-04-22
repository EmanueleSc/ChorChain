'use strict';

// Fabric smart contract classes
const { Contract } = require('fabric-contract-api');
const { logger } = require('../utils/logger');
const ChoreographyState = require('../ledger-api/choreographystate');

const smartContractName = 'org.chorchain.choreography1'; // Name of this smartcontract (must be unique)
const chorElements = ['StartEvent', 'ExclusiveGateway', 'Message', 'EndEvent'];
const ledgerState = {
    chorID: 'CHOR1' // Key of the choreography ledger state (must be unique)
}

class ChoreographyContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super(smartContractName);
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        logger.log('info', 'Instantiate the contract');

        const choreography = new ChoreographyState(ledgerState);
        choreography.initElements(chorElements);
        await choreography.setEnable(ctx, 'StartEvent');
    }

    async queryChor(ctx) {
        logger.log('info', 'QueryChor start');
        logger.log('info', 'Choreography ID: ' + ledgerState.chorID);

        const choreography = await ChoreographyState.getState(ctx, ledgerState.chorID);
        return choreography;
    }

}

module.exports = ChoreographyContract;
