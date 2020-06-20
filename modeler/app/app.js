import ChoreoModeler from 'chor-js/lib/Modeler';
import { createUserIdentity } from './lib/rest';
import { submitPrivateTransaction } from './lib/rest';
import { submitTransaction } from './lib/rest';

import xml from './diagrams/BikeRental.bpmn';

let connectionIDOrg1 = '';
let connectionIDOrg2 = '';
let connectionIDOrg3 = '';
let connectionID = '';
let startEvent = 'Event_0tttznh';
let dataPayload = { 
  channel: 'channel123', 
  contractNamespace: 'choreographyprivatedatacontract', 
  contractName: 'org.chorchain.choreographyprivatedata_1', 
  transactionName: startEvent
  // connectionID
  // transientData
}
let elements = {};

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

function queryChorState() {
  if(connectionID !== '') {
    dataPayload.connectionID = connectionID;
    dataPayload.transactionName = 'queryChorState';
    submitTransaction(dataPayload).then(resp => {
      return bindResp(resp);
    }).catch(error => {
      console.error('something went wrong: ', error);
    });
  } else {
    alert('Click on one organization');
  }
}

function colorElem(e) {
  var overlays = modeler.get('overlays');
  var elementRegistry = modeler.get('elementRegistry');
  var shape = elementRegistry.get(e);

  var $overlayHtml =
    $('<div class="highlight-overlay">')
      .css({
        width: shape.width,
        height: shape.height
      });

  overlays.add(shape, {
    position: {
      top: 0,
      left: 0
    },
    html: $overlayHtml
  });	 
}

function findEnabledElemID() {
  let id = null
  if(Object.keys(elements).length !== 0) {
    for (let [key, value] of Object.entries(elements)) {
      if(value === 'enabled') {
        id = key;
        break;
      }    
    }
  }
  return id
}

function bindResp(output) {
  console.log(output);
  if(typeof output === 'object') {
    if('response' in output) output = output.response;

    if(output.type && output.type === 'Buffer') {
      output = Buffer.from(output.data);
      output = output.toString('utf8');

      const json = JSON.parse(output);
      if('choreography' in json) elements = json.choreography.elements;
      else elements = json.elements;
      
      console.log('RESP JSON: ');
      console.log(JSON.stringify(json));
      console.log('ELEMENtS: ');
      console.log(elements);

      const elem = findEnabledElemID();
      if(elem !== null) {
        colorElem(elem);
      }
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
    await queryChorState();
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
    await queryChorState();
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
    await queryChorState();
  });

  const btnStart = document.getElementById("btnStart");
  btnStart.addEventListener('click', async (e) => {
    if(connectionID !== '') {
      
      const tx = findEnabledElemID();
      if(tx !== null) dataPayload.transactionName = tx;

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