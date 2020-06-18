import ChoreoModeler from 'chor-js/lib/Modeler';

import xml from './diagrams/BikeRental.bpmn';


// create and configure a chor-js instance
const modeler = new ChoreoModeler({
  container: '#canvas',
  keyboard: {
    bindTo: document
  }
});

// display the given model (XML representation)
function renderModel(newXml) {
  modeler.importXML(newXml, {
    // choreoID: '_choreo1'
  }).then(() => {
    modeler.get('canvas').zoom('fit-viewport');
  }).catch(error => {
    console.error('something went wrong: ', error);
  });
}

// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;

renderModel(xml);
