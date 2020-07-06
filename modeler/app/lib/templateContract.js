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
    ENDEVENT: 'bpmn:EndEvent',
    CHOREOGRAPHYTASK: 'bpmn:ChoreographyTask'
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

const _getInitialParticipantMessageID = (outgoingTargetRef) => {
    const initialParticipantID = outgoingTargetRef.initiatingParticipantRef.id
    const messages = outgoingTargetRef.messageFlowRef
    let messageID = ''
    for(let i = 0; i < messages.length; i ++) {
        if(messages[i].sourceRef.id === initialParticipantID) {
            messageID = messages[i].messageRef.id
        }
    }
    return messageID
}

const _exclusiveGatewayTamplate = (obj) => {
    if(!obj) return ''

    let body = ''
    if(obj.outgoing.length === 1) {
        const outgoing = obj.outgoing[0].targetRef

        if(outgoing.$type === typeElem.CHOREOGRAPHYTASK) {
            const messageID = _getInitialParticipantMessageID(outgoing)
            body += `
                choreography.setEnable('${messageID}')
                await choreography.updateState(ctx)
            `
        } else {
            // it's a gateway
            body += `
                choreography.setEnable('${outgoing.id}')
                await this.${outgoing.id}(ctx, choreography, choreographyPrivate)
            `
        }

    } else if(obj.outgoing.length === 2) {
        for(let i = 0; i < obj.outgoing.length; i++) {
            const condition = obj.outgoing[i].name
            const outgoing = obj.outgoing[i].targetRef            

            if(outgoing.$type === typeElem.CHOREOGRAPHYTASK) {
                const messageID = _getInitialParticipantMessageID(outgoing)
                body += `
                if(choreographyPrivate.${condition}) {
                    choreography.setEnable('${messageID}')
                    await choreography.updateState(ctx)
                }
                `
            } else {
                // it's a gateway
                body += `
                if(choreographyPrivate.${condition}) {
                    choreography.setEnable('${outgoing.id}')
                    await this.${outgoing.id}(ctx, choreography, choreographyPrivate)
                }
                `
            }
        }

    }

    return `
        async ${obj.id}(ctx, choreography, choreographyPrivate) {

            if(choreography.elements.${obj.id} === Status.ENABLED) {
                choreography.setDone('${obj.id}')
                ${body}
            } else {
                throw new Error('Element ${obj.id} is not ENABLED')
            }
        }
    `
}

const _eventBasedGatewayTamplate = (obj) => {
    if(!obj) return ''

    let body = ''
    for(let i = 0; i < obj.outgoing.length; i++) {
        const outgoing = obj.outgoing[i].targetRef
        if(outgoing.$type === typeElem.CHOREOGRAPHYTASK) {
            const messageID = _getInitialParticipantMessageID(outgoing)
            body += `choreography.setEnable('${messageID}')` + '\n'
        }
    }

    return `
        async ${obj.id}(ctx, choreography) {

            if(choreography.elements.${obj.id} === Status.ENABLED) {
                choreography.setDone('${obj.id}')
                ${body}
                await choreography.updateState(ctx)
            } else {
                throw new Error('Element ${obj.id} is not ENABLED')
            }
        }
    `
}

const _computeMultipleElements = (arr, template) => {
    if(arr.length === 0) return ''
    let str = ''
    for(let i = 0; i < arr.length; i++) {
        str += template(arr[i])  + '\n'
    }
    return str
}

const smartcontract = (chorID, contractName, chorElements, roles, startEvent, startEventObj, exclusiveGatewayObjs, eventBasedGatewayObjs) => {
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

            ${_computeMultipleElements(exclusiveGatewayObjs, _exclusiveGatewayTamplate)}

            ${_computeMultipleElements(eventBasedGatewayObjs, _eventBasedGatewayTamplate)}

        }

        module.exports = ChoreographyPrivateDataContract

    `
}

module.exports = {
    smartcontract
}