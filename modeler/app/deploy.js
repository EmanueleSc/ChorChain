import { ChorModeler } from './lib/modeler';
import { ChorTranslator } from './lib/translator';
import { deployContract } from './lib/rest';
import { uploadBpmnFile } from './lib/rest';
import xml from './diagrams/newDiagram.bpmn';
// const FileSaver = require('file-saver');

const path = require('path');
// const bpmnPath = path.resolve(__dirname, `diagrams`);
// const chaincodeFile = path.resolve(__dirname, `../../chaincode/lib/choreographyprivatedatacontract.js`);

// create and configure a chor-js instance
const modeler = new ChorModeler();

// API data: bpmnFileName
// OK: idChor, roles, configTxProfile, startEvent, idBpmnFile

document.addEventListener('DOMContentLoaded', () => {
    const btnDeploy = document.getElementById("btnDeploy");
    btnDeploy.addEventListener('click', async (e) => {
        try {
            const chorxml = await modeler.saveModel();
            const translator = new ChorTranslator(chorxml);
            const idBpmnFile = translator.chorID + '.bpmn';

            const file = new File([chorxml], idBpmnFile, {type: "text/plain;charset=utf-8"});
            const data = new FormData()
            data.append('bpmn', file)
            await uploadBpmnFile(data);

        } catch (error) {
            console.log(error);
        }
    });

});

// render the model
modeler.renderModel(xml).catch(error => console.log(error))
