
'use strict';
const contracts = [];

const ChoreographyPrivateDataContract1 = require('./lib/choreographyprivatedatacontract1.js');
contracts.push(ChoreographyPrivateDataContract1);
const ChoreographyPrivateDataContract2 = require('./lib/choreographyprivatedatacontract2.js');
contracts.push(ChoreographyPrivateDataContract2);
module.exports.contracts = contracts;