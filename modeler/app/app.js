import ChoreoModeler from 'chor-js/lib/Modeler';
import { createUserIdentity } from './lib/rest';

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

function bindResp(output) {
  document.getElementById('output').innerHTML = output;
}

document.addEventListener('DOMContentLoaded', () => {

  const btnCustomer = document.getElementById("btnOrg1");
  btnCustomer.addEventListener('click', async (e) => {
    const resp = await createUserIdentity({ orgNum: 1 });
    bindResp(resp.response);
  });

});


// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;

renderModel(xml);
