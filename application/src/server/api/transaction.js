import sendRequest from './sendRequest';

const BASE_PATH = '/api/transaction';

export const submitTransaction = ({ connectionID, channel, contractNamespace, contractName, transactionName, transactionParams }) =>
  sendRequest(`${BASE_PATH}/submit`, { 
        body: JSON.stringify({ connectionID, channel, contractNamespace, contractName, transactionName, transactionParams }) 
    });

export const submitPrivateTransaction = ({ connectionID, channel, contractNamespace, contractName, transactionName }) =>
  sendRequest(`${BASE_PATH}/submit/private`, { 
        body: JSON.stringify({ connectionID, channel, contractNamespace, contractName, transactionName }) 
    });
