const _computeStringElements = (elements) => {
    let str = ''
    for(let i = 0; i < elements.length; i++) {
        str += "'" + elements[i] + "'" + ','
    }
    return str
}

const _computeRoles = (roles) => {
    let str = ''
    for(let i = 0; i < roles.length; i++) {
        str += roles[i] + ': ' + "'Org" + (i+1) + "MSP', "
    }
    return str
}

function * cartesian (head, ...tail) {
    const remainder = tail.length ? cartesian(...tail) : [[]]
    for (const r of remainder) for (const h of head) yield [h, ...r]
}

const _computeCollections = (roles) => {
    const relations = []

    for(let i = 0; i < roles.length-1; i++) {
        relations.push(...cartesian(roles.slice(i, i+1), roles.slice(i+1, roles.length)))
    }
    const relKey = relations.map(e => e[0]+e[1])

    let str = ''
    for(let i = 0; i < relations.length; i++) {
        str += relKey[i] + ": 'collection' + " + "roles." + relations[i][0] + " + " + "roles." + relations[i][1] + ", "
    }
    return str
}

const header = (chorID, contractName, chorElements, roles) => {
    return `
        'use strict'
        const { Contract } = require('fabric-contract-api')
        const { logger } = require('../utils/logger')
        const { ChoreographyState, Status } = require('../ledger-api/choreographystate')
        const { ChoreographyPrivateState } = require('../ledger-api/choreographyprivatestate')
        const chorID = ${chorID}
        const contractName = ${contractName}
        const chorElements = [
            ${_computeStringElements(chorElements)}
        ];
        const roles = { ${_computeRoles(roles)} }
        const collectionsPrivate = {
            ${_computeCollections(roles)}
        }
    `
}

module.exports = {
    header
}