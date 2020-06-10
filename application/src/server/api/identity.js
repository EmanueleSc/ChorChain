import sendRequest from './sendRequest';

const BASE_PATH = '/api/identity';

export const createUserIdentity = ({ orgNum }) =>
  sendRequest(`${BASE_PATH}/create/user`, {
        body: JSON.stringify({ orgNum }) 
    });
