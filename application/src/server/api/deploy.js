import sendRequest from './sendRequest';

const BASE_PATH = '/api/contract';

export const deployContract = ({ idBpmnFile, bpmnFileName, startEvent, roles, configTxProfile, idChor }) =>
  sendRequest(`${BASE_PATH}/deploy`, { 
        body: JSON.stringify({ idBpmnFile, bpmnFileName, startEvent, roles, configTxProfile, idChor }) 
    });
