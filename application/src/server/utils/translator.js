import BpmnModdle from 'bpmn-moddle'
import { smartcontract, cartesian } from './templateContract'

class ChorTranslator {
    /**
     * 
     * @param {String} xml | xml of bpmn model 
     * @param {String} idModel | id model
     * @param {Boolean} generateContract | if true generate the smartcontract (saved in this.contract)
     * @param {String} idChorLedger | id of choreography model used as key of ledger world state
     * @param {Object} subscriptions | the object of subscribed users to the choreography roles
     */
    constructor(xml, idModel, generateContract, idChorLedger, subscriptions) {
        const moddle = new BpmnModdle()
        this.chorID = idChorLedger
        this.roles = {}
        this.configTxProfile = 'OrgsChannel'
        this.startEvent = ''
        this.contract = ''
        this.contractName = `contract${this.chorID}`
        this.channel = `channel${this.chorID}`
        this.collections = []


        return new Promise((resolve, reject) => {
            try {
                return moddle.fromXML(xml).then(obj => {
            
                    let chorElements = this.getElementsIdByType(obj, "bpmn:StartEvent")
                    this.startEvent = chorElements[0]
        
                    const participants = this.getParticipatsNames(obj)
                    this.roles = this.computeRolesObj(participants, idModel)

                    const msps = this.computeMSPsArr(this.roles)
                    this.collections = this.computeCollectionsPolicy(msps)

                    if(generateContract) {
                        const startEventObj = this.getElementsByType(obj, "bpmn:StartEvent")[0]
        
                        chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:ExclusiveGateway"))
                        const exclusiveGatewayObjs = this.getElementsByType(obj, "bpmn:ExclusiveGateway")
        
                        chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:EventBasedGateway"))
                        const eventBasedGatewayObjs = this.getElementsByType(obj, "bpmn:EventBasedGateway")
        
                        chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:Message"))
                        const choreographyTaskObjs = this.getElementsByType(obj, "bpmn:ChoreographyTask")
        
                        chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:ParallelGateway"))
                        chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:EndEvent"))

                        this.contract = smartcontract(
                            idModel, 
                            this.chorID, 
                            this.contractName, 
                            chorElements, 
                            participants, 
                            this.startEvent,
                            startEventObj, 
                            exclusiveGatewayObjs, 
                            eventBasedGatewayObjs, 
                            choreographyTaskObjs,
                            subscriptions
                        )
                    }
                    
                    return resolve(this)
                })
                
            } catch (error) {
                return reject(error)
            }
        })
    }

    /*getModelName(obj) {
        const rootElems = obj.rootElement.rootElements
        let name = ''
        for(let i = 0; i < rootElems.length; i++) {
            if(rootElems[i].$type === 'bpmn:Choreography') name = rootElems[i].name
        }
        return name
    }*/

    getElementsByType(modelObj, type) {
        const obj = modelObj.elementsById
        let arr = []
        for (const [key, e] of Object.entries(obj)) {
            if(e.$type === type) arr.push(e)
        }
        return arr
    }

    getElementsIdByType(modelObj, type) {
        const obj = modelObj.elementsById
        let arr = []
        for (const [key, e] of Object.entries(obj)) {
            if(e.$type === type) arr.push(e.id)
        }
        return arr
    }

    getParticipatsNames(modelObj) {
        const participants = this.getElementsByType(modelObj, "bpmn:Participant")
        return participants.map(p => p.name.replace(" ", "_"))
    }

    computeRolesObj(roles, idModel) {
        let obj = {}
        for(let i = 0; i < roles.length; i++) {
            obj[roles[i]] = "Org" + (i+1) + "MSP" + idModel
        }
        return obj
    }

    computeMSPsArr(roles) {
        const msps = []
        for(const [key, value] of Object.entries(roles)) {
            msps.push(value)
        }
        return msps
    }

    computeCollectionsPolicy(MSPs) {
        const relations = []
        for(let i = 0; i < MSPs.length-1; i++) {
            relations.push(...cartesian(MSPs.slice(i, i+1), MSPs.slice(i+1, MSPs.length)))
        }
        let collections = []
        for(let i = 0; i < relations.length; i++) {
            collections.push({
                collectionName: 'collection' + relations[i][0] + relations[i][1],
                collectionPolicy: `OR("${relations[i][0]}.member","${relations[i][1]}.member")`
            })
        }
        return collections
    }

}

module.exports = {
    ChorTranslator
}