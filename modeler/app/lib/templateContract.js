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

const typeElem = {
    STARTEVENT: 'bpmn:StartEvent',
    MESSAGE: 'bpmn:Message',
    EXCLUSIVEGATEWAY: 'bpmn:ExclusiveGateway',
    PARALLELGATEWAY: 'bpmn:ParallelGateway',
    EVENTBASEDGATEWAY: 'bpmn:EventBasedGateway',
    ENDEVENT: 'bpmn:EndEvent'
}


const _startEventTamplate = (obj) => {
    if(!obj) return ''

    // compute next invoke call
    const outgoing = obj.outgoing[0].targetRef

    let nextInvoke = ''
    if(outgoing.$type === typeElem.MESSAGE)
        nextInvoke = 'await choreography.updateState(ctx)'
    else
        nextInvoke = `await this.${outgoing.id}(ctx, choreography)`

    return `
        async ${obj.id}(ctx) {
            const choreography = await ChoreographyState.getState(ctx, chorID)

            if(choreography.elements.${obj.id} === Status.ENABLED) {
                choreography.setDone('${obj.id}')
                choreography.setEnable('${outgoing.id}')
                ${nextInvoke}

                return choreography
            } else {
                throw new Error('Element ${obj.id} not ENABLED')
            }
        }
    `
}

const smartcontract = (chorID, contractName, chorElements, roles, startEvent, startEventObj) => {
    return `
        'use strict'
        const { Contract } = require('fabric-contract-api')
        const { ChoreographyState, Status } = require('../ledger-api/choreographystate')
        const { ChoreographyPrivateState } = require('../ledger-api/choreographyprivatestate')
        const chorID = '${chorID}'
        const contractName = '${contractName}'
        const chorElements = [
            ${_computeStringElements(chorElements)}
        ]
        const roles = { ${_computeRoles(roles)} }
        const collectionsPrivate = {
            ${_computeCollections(roles)}
        }

        class ChoreographyPrivateDataContract extends Contract {
            constructor() {
                super(contractName)
            }

            async instantiate(ctx) {
                const choreography = new ChoreographyState({ chorID })
                choreography.initElements(chorElements)
                choreography.setEnable('${startEvent}')
                await choreography.updateState(ctx)
                return choreography
            }

            ${_startEventTamplate(startEventObj)}

        }

        module.exports = ChoreographyPrivateDataContract

    `
}

module.exports = {
    smartcontract
}