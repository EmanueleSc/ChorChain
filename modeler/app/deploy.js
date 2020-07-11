import { ChorModeler } from './lib/modeler'; // my lib
// import { ChorTranslator } from './lib/translator'; // TEST
import xml from './diagrams/newDiagram.bpmn';

// create and configure a chor-js instance
const modeler = new ChorModeler();
//const translator = new ChorTranslator(xml); // TEST


document.addEventListener('DOMContentLoaded', () => {
    const btnDeploy = document.getElementById("btnDeploy");
    btnDeploy.addEventListener('click', async (e) => {
        try {
            const xml = await modeler.saveModel();
            console.log(xml);
        } catch (error) {
            console.log(error);
        }
    });

});

// render the model
modeler.renderModel(xml).catch(error => console.log(error))
