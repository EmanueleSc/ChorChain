import ChoreoModeler from 'chor-js/lib/Modeler';

class ChorModeler {
    constructor() {
        // create and configure a chor-js instance
        this.modeler = new ChoreoModeler({
            container: '#canvas',
            keyboard: { bindTo: document }
        })
        // expose bpmnjs to window for debugging purposes
        window.bpmnjs = this.modeler
    }

    renderModel(newXml, chorID) {
        const mobj = {}
        if(chorID) mobj.choreoID = chorID

        return new Promise((resolve, reject) => {
            return this.modeler.importXML(newXml, mobj)
            .then(() => {
                this.modeler.get('canvas').zoom('fit-viewport')
                resolve('Model rendering done!')
            })
            .catch(error => {
                console.error('function renderModel ERROR: ', error)
                reject(error)
            })
        })
    }

    saveModel() {
        return new Promise((resolve, reject) => {
            return this.modeler.saveXML({ format: true }, (err, xml) => {
                if(err) return reject(err)
                return resolve(xml)
            })
        })
    }

    colorElem(elemID) {
        let overlays = this.modeler.get('overlays')
        let elementRegistry = this.modeler.get('elementRegistry')
        let shape = elementRegistry.get(elemID)
      
        let $overlayHtml = $('<div class="highlight-overlay">').css({
            width: shape.width,
            height: shape.height
        })
        
        overlays.add(shape, {
            position: {
                top: 0,
                left: 0
            },
            html: $overlayHtml
        }) 
    }

    findEnabledElementsID(elements) {
        let arrID = []
        if(Object.keys(elements).length !== 0) {
          for (let [key, value] of Object.entries(elements)) {
            if(value === 'enabled') {
                arrID.push(key)
            }    
          }
        }
        return arrID
    }

    findFirstEnabledElementID(elements) {
        let id = null
        if(Object.keys(elements).length !== 0) {
            for (let [key, value] of Object.entries(elements)) {
                if(value === 'enabled') {
                    id = key
                    break
                }    
            }
        }
        return id
    }

    getAnnotationParams(elemID) {
        const elementRegistry = this.modeler.get('elementRegistry')
        const elem = elementRegistry.get(elemID)
        const paramStr = elem.businessObject.name
        if(paramStr) {
          return paramStr.split('(').pop().split(')')[0].split(', ').map(e => e.split(' ')[1])
        }
        return []
    }

    getAnnotation(elemID) {
        const elementRegistry = this.modeler.get('elementRegistry')
        const elem = elementRegistry.get(elemID)
        return elem.businessObject.name
    }

    getInitialParticipant(messageElemID) {
        const elementRegistry = this.modeler.get('elementRegistry')
        const elem = elementRegistry.get(messageElemID)
        if(elem.type === "bpmn:Message") {
            return elem.parent.activityShape.businessObject.initiatingParticipantRef.name
        }
        return null
    }

}

module.exports = {
    ChorModeler
}
