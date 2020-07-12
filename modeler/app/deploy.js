import { ChorModeler } from './lib/modeler';
import { ChorTranslator } from './lib/translator';
import { deployContract } from './lib/rest';
import { uploadBpmnFile } from './lib/rest';
import xml from './diagrams/newDiagram.bpmn';
// const FileSaver = require('file-saver');
const Prism = require('prismjs');

// create and configure a chor-js instance
const modeler = new ChorModeler();


document.addEventListener('DOMContentLoaded', () => {
    const btnCode = document.getElementById("btnCode");
    btnCode.addEventListener('click', async (e) => {
        const chorxml = await modeler.saveModel();
        const translator = await new ChorTranslator(chorxml);
        const html = Prism.highlight(translator.contract, Prism.languages.javascript, 'javascript');
        document.getElementById('codeViewer').innerHTML = html;
    });

    const btnDeploy = document.getElementById("btnDeploy");
    btnDeploy.addEventListener('click', async (e) => {
        try {
            const chorxml = await modeler.saveModel();
            const translator = await new ChorTranslator(chorxml);
            const idBpmnFile = translator.chorID + '.bpmn';
            const bpmnFileName = translator.modelName;
            const startEvent = translator.startEvent;
            const roles = translator.roles;
            const configTxProfile = translator.configTxProfile;
            const idChor = translator.chorID;
            const smartcontract = translator.contract;
            const contractName = translator.contractName;

            const bpmnfile = new File([chorxml], idBpmnFile, {type: "text/plain;charset=utf-8"});
            const contractFile = new File([smartcontract], contractName,  {type: "text/plain;charset=utf-8"});
            const formData = new FormData();
            formData.append('bpmn', bpmnfile);
            formData.append('contract', contractFile);
            await uploadBpmnFile(formData);


            // deploy data
            const data = { idBpmnFile, bpmnFileName, startEvent, roles, configTxProfile, idChor }
            console.log(data)


        } catch (error) {
            console.log(error);
        }
    });

});

// render the model
modeler.renderModel(xml).catch(error => console.log(error))
