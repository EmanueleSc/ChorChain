import sendRequest from './sendRequest';

export const createUserIdentity = ({ 
    orgNum 
}) => sendRequest(`/api/identity/create/user`, {
    body: JSON.stringify({ orgNum }) 
});

export const submitTransaction = ({ 
    connectionID, 
    channel, 
    contractNamespace, 
    contractName, 
    transactionName, 
    transactionParams 
}) => sendRequest(`/api/transaction/submit`, { 
    body: JSON.stringify({ connectionID, channel, contractNamespace, contractName, transactionName, transactionParams }) 
});

export const submitPrivateTransaction = ({ 
    connectionID, 
    channel, 
    contractNamespace, 
    contractName, 
    transactionName,
    transientData
}) => sendRequest(`/api/transaction/submit/private`, { 
    body: JSON.stringify({ connectionID, channel, contractNamespace, contractName, transactionName, transientData }) 
});

export const deployContract = ({ 
    idBpmnFile, 
    bpmnFileName, 
    startEvent, 
    roles, 
    configTxProfile, 
    idChor 
}) => sendRequest(`/api/contract/deploy`, { 
    body: JSON.stringify({ idBpmnFile, bpmnFileName, startEvent, roles, configTxProfile, idChor }) 
});

export const uploadBpmnFile = ( data ) => sendRequest(`/api/file/upload`, { body: data }, true);
