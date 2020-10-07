import sendRequest from './sendRequest';

export const createUserIdentity = ({
    OrgMspID
}) => sendRequest(`/api/identity/create/user`, {
    body: JSON.stringify({ OrgMspID })
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

// DEPRECATED
/*export const deployContract = ({ 
    idBpmnFile, 
    bpmnFileName, 
    startEvent, 
    roles, 
    configTxProfile, 
    idChor 
}) => sendRequest(`/api/contract/deploy`, { 
    body: JSON.stringify({ idBpmnFile, bpmnFileName, startEvent, roles, configTxProfile, idChor }) 
});*/

// DEPRECATED
// export const uploadBpmnFile = ( data ) => sendRequest(`/api/file/upload`, { body: data }, true);

// DEPRECATED
/*export const fetchChorInstances = ({ hello }) => sendRequest(`/api/chorinstance/fetch`, {
    body:  JSON.stringify({ hello })
});*/

export const fetchChorInstancesDeployed = ({ idUser }) => sendRequest(`/api/chorinstance/instances/deployed`, {
    body:  JSON.stringify({ idUser })
});

export const fetchChorInstanceFile = ({ idBpmnFile }) => sendRequest(`/api/chorinstance/fetch/file`, { 
    body:  JSON.stringify({ idBpmnFile })
}, false);
