import BpmnModdle from 'bpmn-moddle'
import { smartcontract } from './templateContract'
const { v4: uuidv4 } = require('uuid')

class ChorTranslator {
    constructor(xml) {
        const moddle = new BpmnModdle()
        this.chorID = uuidv4()
        this.roles = {}
        this.configTxProfile = 'ThreeOrgsChannel' // default
        this.startEvent = ''
        this.modelName = ''
        this.contract = ''
        this.contractName = `org.hyreochain.choreographyprivatedata_${this.chorID}`

        return new Promise((resolve, reject) => {
            try {
                return moddle.fromXML(xml).then(obj => {
                    this.modelName = this.getModelName(obj)
                    
                    let chorElements = this.getElementsIdByType(obj, "bpmn:StartEvent")
                    this.startEvent = chorElements[0]
                    const startEventObj = this.getElementsByType(obj, "bpmn:StartEvent")[0]
        
                    chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:ExclusiveGateway"))
                    const exclusiveGatewayObjs = this.getElementsByType(obj, "bpmn:ExclusiveGateway")
        
                    chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:EventBasedGateway"))
                    const eventBasedGatewayObjs = this.getElementsByType(obj, "bpmn:EventBasedGateway")
        
                    chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:Message"))
                    const choreographyTaskObjs = this.getElementsByType(obj, "bpmn:ChoreographyTask")
        
                    chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:ParallelGateway"))
                    chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:EndEvent"))
        
                    const participants = this.getParticipatsNames(obj)
                    this.roles = this.computeRolesObj(participants)
                    if(participants.length === 2) this.configTxProfile = 'TwoOrgsChannel'
        
                    this.contract = smartcontract(
                        this.chorID, this.contractName, chorElements, participants, this.startEvent,
                        startEventObj, exclusiveGatewayObjs, eventBasedGatewayObjs, choreographyTaskObjs
                    )
                    
                    return resolve(this)
                })
                
            } catch (error) {
                return reject(error)
            }
        })
    }

    getModelName(obj) {
        const rootElems = obj.rootElement.rootElements
        let name = ''
        for(let i = 0; i < rootElems.length; i++) {
            if(rootElems[i].$type === 'bpmn:Choreography') name = rootElems[i].name
        }
        return name
    }

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

    computeRolesObj(roles) {
        let obj = {}
        for(let i = 0; i < roles.length; i++) {
            obj[roles[i]] = "Org" + (i+1) + "MSP"
        }
        return obj
    }

}

module.exports = {
    ChorTranslator
}