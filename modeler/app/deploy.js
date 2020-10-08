
/**
 * ******************************
 * !!! PAGE DEPRECATED !!!
 * 
 * ******************************
 */



/*
import { ChorModeler } from './lib/modeler';
import { ChorTranslator } from './lib/translator';
import { deployContract } from './lib/rest';
import { uploadBpmnFile } from './lib/rest';
import xml from './diagrams/newDiagram.bpmn';
// const FileSaver = require('file-saver');
const Prism = require('prismjs');

// create and configure a chor-js instance
const modeler = new ChorModeler();
// data sent to deploy contract API
let data = {};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            let contents = e.target.result;
            modeler.renderModel(contents);
        };
        reader.readAsText(file);
    }, false);

    const btnCode = document.getElementById("btnCode");
    btnCode.addEventListener('click', async (e) => {
        const chorxml = await modeler.saveModel();
        const translator = await new ChorTranslator(chorxml);
        const html = Prism.highlight(translator.contract, Prism.languages.javascript, 'javascript');
        document.getElementById('codeViewer').innerHTML = html;
    });

    const btnUpload = document.getElementById("btnUpload");
    btnUpload.addEventListener('click', async (e) => {
        const chorxml = await modeler.saveModel();
        const translator = await new ChorTranslator(chorxml);
    
        const idBpmnFile = translator.chorID + '.bpmn';
        const bpmnFileName = translator.modelName;
        if(!bpmnFileName) {
            alert('Rename the model first!');
            return;
        }
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

        data.idBpmnFile = idBpmnFile;
        data.bpmnFileName = bpmnFileName;
        data.startEvent = startEvent;
        data.roles = roles;
        data.configTxProfile = configTxProfile;
        data.idChor = idChor;

        alert('Model uploaded!');
    });

    const btnDeploy = document.getElementById("btnDeploy");
    btnDeploy.addEventListener('click', async (e) => {
        try {
            if(Object.keys(data).length === 0) {
                alert('Upload the model first!');
                return;
            }
            console.log(data)

            let deployElem = document.querySelector('.deploy');
            deployElem.classList.add('loading');
            const deployResp = await deployContract(data);
            deployElem.classList.remove('loading');

            console.log(deployResp);
            alert('Deploy contract completed!')

        } catch (error) {
            deployElem.classList.remove('loading');
            console.log(error);
        }
    });

});

// render the model
modeler.renderModel(xml).catch(error => console.log(error))
*/