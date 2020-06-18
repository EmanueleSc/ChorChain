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
    transactionName 
}) => sendRequest(`/api/transaction/submit/private`, { 
    body: JSON.stringify({ connectionID, channel, contractNamespace, contractName, transactionName }) 
});
