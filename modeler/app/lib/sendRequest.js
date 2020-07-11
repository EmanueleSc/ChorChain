import 'isomorphic-unfetch';

const applicationServerPort = 3000;
const ROOT_URL = `http://localhost:${applicationServerPort}`;

export default async function sendRequest(path, options = {}, sendFile) {
  let headers = {}
  let request = Object.assign({ method: 'POST', credentials: 'same-origin' }, options)

  if(!sendFile) {
    headers = Object.assign({}, options.headers || {}, {
      'Content-type': 'application/json; charset=UTF-8',
    });
    request = Object.assign(request, { headers })
  }
   

  const response = await fetch(
    `${ROOT_URL}${path}`,
    request,
  );

  const data = await response.json();

  if (data.error) {
    // throw new Error(data.error);
    console.log(data.error)
  }

  return data;
}