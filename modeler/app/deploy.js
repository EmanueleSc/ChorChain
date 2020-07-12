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


document.addEventListener('DOMContentLoaded', () => {
    const btnDeploy = document.getElementById("btnDeploy");
    btnDeploy.addEventListener('click', async (e) => {
        try {
            const chorxml = await modeler.saveModel();
            const translator = await new ChorTranslator(chorxml);
            const idBpmnFile = translator.chorID + '.bpmn';

            //const bpmnfile = new File([chorxml], idBpmnFile, {type: "text/plain;charset=utf-8"});
            //const formData = new FormData()
            //formData.append('bpmn', bpmnfile)
            //await uploadBpmnFile(formData);


            // deploy data
            const data = {
                idBpmnFile: idBpmnFile, 
                bpmnFileName: translator.modelName, 
                startEvent: translator.startEvent, 
                roles: translator.roles, 
                configTxProfile: translator.configTxProfile, 
                idChor: translator.chorID
            }
            console.log(data)
            console.log(translator.contract)


        } catch (error) {
            console.log(error);
        }
    });

});

// render the model
modeler.renderModel(xml).catch(error => console.log(error))
