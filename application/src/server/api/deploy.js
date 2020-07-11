import sendRequest from './sendRequest';

const BASE_PATH = '/api/deploy';

export const deployContract = ({ idBpmnFile, bpmnFileName, startEvent, roles, configTxProfile, idChor }) =>
  sendRequest(`${BASE_PATH}/contract`, { 
        body: JSON.stringify({ idBpmnFile, bpmnFileName, startEvent, roles, configTxProfile, idChor }) 
    });
