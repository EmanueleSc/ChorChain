import BpmnModdle from 'bpmn-moddle';
import { smartcontract } from './templateContract'
const { v4: uuidv4 } = require('uuid');

class ChorTranslator {
    constructor(xml) {
        const moddle = new BpmnModdle()
        this.chorID = uuidv4()
        this.roles = {}
        this.configTxProfile = 'ThreeOrgsChannel' // default
        this.startEvent = ''
        const contractName = `org.hyreochain.choreographyprivatedata_${this.chorID}`

        moddle.fromXML(xml).then(obj => {
            console.log(obj)
            
            let chorElements = this.getElementsIdByType(obj, "bpmn:StartEvent")
            this.startEvent = chorElements[0]
            const startEventObj = this.getElementsByType(obj, "bpmn:StartEvent")[0]

            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:ExclusiveGateway"))
            const exclusiveGatewayObjs = this.getElementsByType(obj, "bpmn:ExclusiveGateway")

            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:EventBasedGateway"))
            const eventBasedGatewayObjs = this.getElementsByType(obj, "bpmn:EventBasedGateway")

            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:Message"))
            const choreographyTaskObjs = this.getElementsByType(obj, "bpmn:ChoreographyTask")
            console.log(choreographyTaskObjs)

            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:ParallelGateway"))
            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:EndEvent"))

            const participants = this.getParticipatsNames(obj)
            this.roles = this.computeRolesObj(participants)
            if(participants.length === 2) this.configTxProfile = 'TwoOrgsChannel'

            const contract = smartcontract(
                this.chorID, contractName, chorElements, participants, this.startEvent,
                startEventObj, exclusiveGatewayObjs, eventBasedGatewayObjs, choreographyTaskObjs
            )
            console.log(contract)
        })
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

    computeRolesObj = (roles) => {
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
