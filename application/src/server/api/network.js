import sendRequest from './sendRequest';

const BASE_PATH = '/api/network';

export const createOrg1Identity = () =>
  sendRequest(`${BASE_PATH}/create/org1/identity`, {
    method: 'GET',
});

export const createOrg1Gateway = () =>
  sendRequest(`${BASE_PATH}/create/org1/gateway`, {
    method: 'GET',
});

/* export const addBook = ({ name, price, githubRepo }) =>
  sendRequest(`${BASE_PATH}/books/add`, {
    body: JSON.stringify({ name, price, githubRepo }),
  });

export const editBook = ({ id, name, price, githubRepo }) =>
  sendRequest(`${BASE_PATH}/books/edit`, {
    body: JSON.stringify({
      id,
      name,
      price,
      githubRepo,
    }),
  });

export const getBookDetail = ({ slug }) =>
  sendRequest(`${BASE_PATH}/books/detail/${slug}`, {
    method: 'GET',
  }); */