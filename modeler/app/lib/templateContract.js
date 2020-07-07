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

const _computeRelations = (roles) => {
    const relations = []

    for(let i = 0; i < roles.length-1; i++) {
        relations.push(...cartesian(roles.slice(i, i+1), roles.slice(i+1, roles.length)))
    }
    return relations.map(e => e[0]+e[1])
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

const _getDisabledMessageID = (incomingSourceRef, enabledMessageID) => {
    let messageDisabled = ''
    if(incomingSourceRef.$type === typeElem.EVENTBASEDGATEWAY) {
        for(let i = 0; i < incomingSourceRef.outgoing.length; i++) {
            const target = incomingSourceRef.outgoing[i].targetRef
            const targetMessageID = _getInitialParticipantMessageID(target)
            if(targetMessageID !== enabledMessageID) messageDisabled = targetMessageID
        }
    }
    return messageDisabled
}

const _getParticipantNames = (obj) => {
    const names = []
    if(obj.$type === typeElem.CHOREOGRAPHYTASK) {
        for(let i = 0; i < obj.participantRef.length; i++) {
            names.push(obj.participantRef[i].name.replace(" ", "_"))
        }
    }
    return names
}

const _getCollection = (relationsArr, rolesArr) => {
    let collection = ''
    for(let i = 0; i < relationsArr.length; i++) {
        if(relationsArr[i].includes(rolesArr[0]) && relationsArr[i].includes(rolesArr[1]))
        collection = relationsArr[i]
    }
    return collection
}

const _messageTamplate = (obj, roles) => {
    if(!obj) return ''
    const relations = _computeRelations(roles)
    const names = _getParticipantNames(obj)
    const collection = _getCollection(relations, names)
    const submitter = obj.initiatingParticipantRef.name.replace(" ", "_")

    // one-way task
    if(obj.messageFlowRef.length === 1) {
        let body = ''
        const messageID = obj.messageFlowRef[0].messageRef.id
        const outgoing = obj.outgoing[0].targetRef
        const incoming = obj.incoming[0].sourceRef
        let messageDisabled = _getDisabledMessageID(incoming, messageID)

        if(outgoing.$type === typeElem.CHOREOGRAPHYTASK) {
            const outgoingMessageID = _getInitialParticipantMessageID(outgoing)
            
            body += `choreography.setEnable('${outgoingMessageID}')` + '\n'
            if(messageDisabled) body += `choreography.setDisable('${messageDisabled}')` + '\n'
            body += `await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.${collection})` + '\n'
            body += `await choreography.updateState(ctx)` + '\n'

        } else {
            // it's a gateway
            body += `choreography.setEnable('${outgoing.id}')` + '\n'
            if(messageDisabled) body += `choreography.setDisable('${messageDisabled}')` + '\n'
            body += `await choreographyPrivate.updatePrivateState(ctx, collectionsPrivate.${collection})` + '\n'
            body += `await this.${outgoing.id}(ctx, choreography, choreographyPrivate)` + '\n'
        }

        return `
            async ${messageID}(ctx) {
                /* one-way task */
                const choreography = await ChoreographyState.getState(ctx, chorID)

                if(choreography.elements.${messageID} === Status.ENABLED && roles.${submitter} === ctx.stub.getCreator().mspid) {
                    const choreographyPrivate = await ChoreographyPrivateState.getPrivateState(ctx, collectionsPrivate.${collection}, chorID)
                    choreography.setDone('${messageID}')
                    
                    ${body}

                    return { choreography, choreographyPrivate }
                } else {
                    throw new Error('Element ${messageID} is not ENABLED or submitter not allowed, only the ${submitter} can send this transaction')
                }
            }
        `

    } else if(obj.messageFlowRef.length === 2) { // two-way task

    }
}


const _computeMultipleElements = (arr, template, args) => {
    if(arr.length === 0) return ''
    let str = ''
    for(let i = 0; i < arr.length; i++) {
        if(args) str += template(arr[i], args)  + '\n'
        else str += template(arr[i])  + '\n'
    }
    return str
}

const smartcontract = (chorID, contractName, chorElements, roles, startEvent, startEventObj, exclusiveGatewayObjs, eventBasedGatewayObjs, choreographyTaskObjs) => {
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

            ${_computeMultipleElements(choreographyTaskObjs, _messageTamplate, roles)}

        }

        module.exports = ChoreographyPrivateDataContract

    `
}

module.exports = {
    smartcontract
}