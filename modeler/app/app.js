import ChoreoModeler from 'chor-js/lib/Modeler';
import { createUserIdentity } from './lib/rest';
import { submitPrivateTransaction } from './lib/rest';

import xml from './diagrams/BikeRental.bpmn';

let connectionIDOrg1 = ''
let connectionIDOrg2 = ''
let connectionIDOrg3 = ''
let connectionID = ''
let dataPayload = {
  //connectionID: connectionID, 
  channel: 'channel123', 
  contractNamespace: 'choreographyprivatedatacontract', 
  contractName: 'org.chorchain.choreographyprivatedata_1', 
  transactionName: 'Event_0tttznh', // Choreography StartEvent
  //transactionName: 'Message_11j40xz', // Choreography Message
  // transientData TODO
}
let elements = {}

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
  if(typeof output === 'object') {
    if(output.type && output.type === 'Buffer') {
      output = Buffer.from(output.data);
      output = output.toString('utf8');

      const json = JSON.parse(output);
      if('choreography' in json) elements = json.choreography.elements;
      else elements = json.elements;
      console.log('RESP: ');
      console.log(elements);
    }
  }
  document.getElementById('output').innerHTML = output;
}

document.addEventListener('DOMContentLoaded', () => {

  const btnCustomer = document.getElementById("btnOrg1");
  btnCustomer.addEventListener('click', async (e) => {
    if(connectionIDOrg1 === '') {
      const resp = await createUserIdentity({ orgNum: 1 });
      connectionIDOrg1 = resp.response;
      bindResp(connectionIDOrg1);
    } else {
      bindResp(connectionIDOrg1);
    }

    connectionID = connectionIDOrg1;
  });

  const btnBikeCenter = document.getElementById("btnOrg2");
  btnBikeCenter.addEventListener('click', async (e) => {
    if(connectionIDOrg2 === '') {
      const resp = await createUserIdentity({ orgNum: 2 });
      connectionIDOrg2 = resp.response;
      bindResp(connectionIDOrg2);
    } else {
      bindResp(connectionIDOrg2);
    }

    connectionID = connectionIDOrg2;
  });

  const btnInsurer = document.getElementById("btnOrg3");
  btnInsurer.addEventListener('click', async (e) => {
    if(connectionIDOrg3 === '') {
      const resp = await createUserIdentity({ orgNum: 3 });
      connectionIDOrg3 = resp.response;
      bindResp(connectionIDOrg3);
    } else {
      bindResp(connectionIDOrg3);
    }

    connectionID = connectionIDOrg3;
  });

  const btnStart = document.getElementById("btnStart");
  btnStart.addEventListener('click', async (e) => {
    if(connectionID !== '') {
  
      if(Object.keys(elements).length !== 0) {
        let tx
        for (let [key, value] of Object.entries(elements)) {
          if(value === 'enabled') {
            tx = key;
            break;
          }    
        }
        dataPayload.transactionName = tx;
      }

      dataPayload.connectionID = connectionID;
      console.log('DATA PAYLOAD: ');
      console.log(JSON.stringify(dataPayload));

      const resp = await submitPrivateTransaction(dataPayload);
      if(resp.error) bindResp(resp.error);
      else bindResp(resp.response);

    } else {
      alert('Click on one organization');
    }
  });

});


// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;

renderModel(xml);
