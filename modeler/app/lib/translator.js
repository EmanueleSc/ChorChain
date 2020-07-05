import BpmnModdle from 'bpmn-moddle';
import { header } from './templateContract'

class ChorTranslator {
    constructor(xml) {
        const moddle = new BpmnModdle()

        moddle.fromXML(xml).then(obj => {
            console.log(obj)
            
            let chorElements = this.getElementsIdByType(obj, "bpmn:StartEvent")
            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:Message")) 
            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:ExclusiveGateway"))
            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:ParallelGateway"))
            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:EventBasedGateway"))
            chorElements = chorElements.concat(this.getElementsIdByType(obj, "bpmn:EndEvent"))

            const participants = this.getParticipatsNames(obj)
            console.log(header('chor1', 'chorcontract', chorElements, participants))
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


}

module.exports = {
    ChorTranslator
}
