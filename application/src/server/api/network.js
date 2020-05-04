import sendRequest from './sendRequest';

const BASE_PATH = '/api/network';

export const createOrg1Identity = () =>
  sendRequest(`${BASE_PATH}/create/org1/identity`, { method: 'GET' });

export const createOrg1ConnectionID = () =>
  sendRequest(`${BASE_PATH}/create/org1/connection`, { method: 'GET' });

export const submitTransaction = ({ connectionID, channel, contractNamespace, contractName, transactionName, transactionParams }) =>
  sendRequest(`${BASE_PATH}/submit/transaction`, { 
        body: JSON.stringify({ connectionID, channel, contractNamespace, contractName, transactionName, transactionParams }) 
    });
