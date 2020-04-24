import sendRequest from './sendRequest';

const BASE_PATH = '/api/helloworld';

export const helloWorld = () =>
  sendRequest(`${BASE_PATH}/hello`, {
    method: 'GET',
});
