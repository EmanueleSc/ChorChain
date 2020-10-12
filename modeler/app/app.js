import { ChorModeler } from './lib/modeler' // my lib
import { createUserIdentity } from './lib/rest'
import { submitPrivateTransaction } from './lib/rest'
import { submitTransaction } from './lib/rest'
import { fetchChorInstancesDeployed } from './lib/rest'
import { fetchChorInstanceFile } from './lib/rest'
import JSONFormatter from 'json-formatter-js'

let userID = ''
let connectionID = ''
let dataPayload = { 
  // channel: 'channel123', 
  // contractNamespace: 'choreographyprivatedatacontract', 
  // contractName: 'org.chorchain.choreographyprivatedata_1', 
  // transactionName: 'Event_0tttznh', // startEvent
  // connectionID
  // transientData
}
let elements = {}
let chorInstances = []

// create and configure a chor-js instance
const modeler = new ChorModeler()

function updateUI() {
  // update menu left
  let items = `<a id="${chorInstances[0]._id}" class="leftmenuitem item active">${chorInstances[0].model[0].idModel}</a>` // first item
  for(let i = 1; i < chorInstances.length; i++) {
    items += `
      <a id="${chorInstances[i]._id}" class="leftmenuitem item">${chorInstances[i].model[0].idModel}</a>
    `
  }
  document.getElementById('leftmenu').innerHTML = items

  // add event listener to left menu items
  for(let i = 0; i < chorInstances.length; i++) {
    document.getElementById(chorInstances[i]._id).addEventListener('click', menuItemClick)
  }
}

async function menuItemClick(e) {
  // active selected element
  let items = document.querySelectorAll('.leftmenuitem')
  items.forEach(b => b.classList.remove('active'))
  e.target.classList.add('active')

  let chorInstanceTarget
  // get chor instance target object
  for(let i = 0; i < chorInstances.length; i++) {
    if(chorInstances[i]._id === e.target.id) {
      chorInstanceTarget =  chorInstances[i]
      break
    }
  }
  
  const idBpmnFile = chorInstanceTarget.idModel + ".bpmn"
  const resp = await fetchChorInstanceFile({ idBpmnFile })
  await modeler.renderModel(resp.response)
  whichRoleAmI(chorInstanceTarget._id)

  dataPayload = {
    channel: chorInstanceTarget.channel,
    contractName: chorInstanceTarget.contractName,
    // contractNamespace: 'choreographyprivatedatacontract', 
    transactionName: chorInstanceTarget.startEvent
  }

  // switching from chor instances, the user reconnect to the test network with the role/organisation subscribed
  await connectUser(chorInstanceTarget.subscriptions, chorInstanceTarget.roles)
  await queryChorState()
}

function whichRoleAmI(chorInstanceID) {
  let subscriptions
  for(let i = 0; i < chorInstances.length; i++) {
    if(chorInstances[i]._id === chorInstanceID || chorInstances[i].idChorLedger === chorInstanceID) subscriptions = chorInstances[i].subscriptions
  }

  const subRole = Object.keys(subscriptions).find(key => subscriptions[key] === userID)
  document.getElementById('whoAmI').innerText = "You are subscribed as " + subRole
  return subRole
}

/**
 * First function called when page loads.
 * It also saves the userID in a global variable for later use.
 */
function fetchChors() {
  // get idUser from the URL
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  userID = urlParams.get('idUser')

  return new Promise((resolve, reject) => {
      return fetchChorInstancesDeployed({ idUser: userID })
      .then(res => resolve(res.response))
      .catch(err => reject(err))
  })
}

/**
 * Connect the logged user to the fabric test network. It also saves connectionID for later use.
 * Params:
 * subscriptions: object with subscribed users to the selected choreography instance.
 * roles: object with roles mapping to organisation MSP ID of the selected choreography instance.
 */
function connectUser(subscriptions, roles) {
  // get the user subscribed role throgh its user id
  const subRole = Object.keys(subscriptions).find(key => subscriptions[key] === userID)
  // get the organisation MSP ID 
  const OrgMspID = roles[subRole]

  // connect the user to fabric test network
  return new Promise((resolve, reject) => {
    return createUserIdentity({ OrgMspID })
    .then(res => {
      connectionID = res.response
      bindResp(connectionID)
      return resolve(res)
    })
    .catch(err => reject(err))
  })
}

function submitTX(private) {
  return new Promise(async (resolve, reject) => {
    const RETRY = 25
    let lastError, resp

    for(let i = 1; i <= RETRY; i++) {

        if(private) {
          resp = await submitPrivateTransaction(dataPayload)
        } else {
          resp = await submitTransaction(dataPayload)
        }
        
        if(resp.error) {
          lastError = resp.error
          console.log(lastError)
          console.log("!!! RETRY submit transaction (private: " + private + ")")
        } else {
          return resolve(resp.response || resp)
        }
    }

    return reject(lastError)
  })
}

function queryChorState() {
  if(connectionID !== '') {
    dataPayload.connectionID = connectionID
    dataPayload.transactionName = 'queryChorState'

    return new Promise(async (resolve, reject) => {
      try {
        const res = await submitTX(false)
        bindResp(res)
        return resolve(res)
        
      } catch (err) {
        return reject(err)
      }
    })

  } else {
    console.error('Connection ID empty, please reload the page.')
  }
}

function templateParams(index) {
  return `<p id="params${index}"></p>` + 
         '<div style="display:flex;" class="div-input ui input focus">' +
            `<input id="paramsInput${index}" type="text" placeholder="value,value ...">` +
         '</div>';
}

function removeChilds(nodeID) {
  const node = document.getElementById(nodeID);
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}

function formatOutput(obj, res) {
  if(!res) res = {}
  if(typeof obj === 'object') {
      const e = Object.entries(obj)

      for(x in e) {
          let el = e[x]
          if(typeof el[1] === 'object') formatOutput(el[1], res)
          else res[el[0]] = el[1]
      }
  }
  return res
}

function renderRightPanel(output) {
    let formatter
    if(typeof output === 'string') output = JSON.parse(output)
    if(typeof output === 'object') {
      if(output.hasOwnProperty('choreographyPrivate')) {
        output = formatOutput(output.choreographyPrivate)
        formatter = new JSONFormatter(output)
      } else {
        formatter = new JSONFormatter(formatOutput(output))
      }
    }
    if(formatter) document.getElementById('output').appendChild(formatter.render());
}

function renderLeftPanel(elements, idChorLedger) {
  const elems = modeler.findEnabledElementsID(elements)
  if(elems.length !== 0) {
    removeChilds('inputContainer')
    
    for(let i = 0; i < elems.length; i++) {
      const elemID = elems[i]
      modeler.colorElem(elemID)
      const messageAnnotation = modeler.getAnnotation(elemID)
      const initialParticipant = modeler.getInitialParticipant(elemID)
      const subRole = whichRoleAmI(idChorLedger)

      if(initialParticipant.replace(" ", "_") === subRole) {
        if(messageAnnotation) {
          document.getElementById('inputContainer').innerHTML += templateParams(elemID)
          document.getElementById(`params${elemID}`).innerHTML = modeler.getAnnotation(elemID)
        }
      } else {
        const message = "Waiting for the message of "
        document.getElementById('inputContainer').innerHTML = `<p>${message}${initialParticipant}</p>`
      }
    }
  }
}

function bindResp(output) {
  if(typeof output === 'object') {
    if('response' in output) output = output.response

    if(output.type && output.type === 'Buffer') {
      output = Buffer.from(output.data)
      output = output.toString('utf8')

      const json = JSON.parse(output)
      let idChorLedger

      if('choreography' in json) {
        idChorLedger = json.choreography.chorID
        elements = json.choreography.elements
      }
      else {
        idChorLedger = json.chorID
        elements = json.elements
      }
      
      console.log('RESP JSON:')
      console.log(json)
      console.log('ELEMENTS:')
      console.log(elements)

      renderLeftPanel(elements, idChorLedger)
    }

    removeChilds('output')
    renderRightPanel(output)
  } else {
    document.getElementById('output').innerHTML = output
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // botton start
  document.getElementById("btnStart").addEventListener('click', async (e) => {
    if(connectionID !== '') {
      let paramsArr = []
      let tx = null
      const elems = modeler.findEnabledElementsID(elements)

      if(elems.length !== 0) {
        for(let i = 0; i < elems.length; i++) {
          const elemID = elems[i]
          const messageAnnotation = modeler.getAnnotation(elemID)
          // check if the element has an annotation string
          if(messageAnnotation) {
            let values = document.getElementById(`paramsInput${elemID}`).value
            if(values && values !== '') {
              tx = elemID
              break
            }
          }
        }
      }

      if(tx === null) tx = modeler.findFirstEnabledElementID(elements)
      if(tx !== null) dataPayload.transactionName = tx
      dataPayload.connectionID = connectionID
      paramsArr = modeler.getAnnotationParams(tx)

      if(paramsArr.length !== 0) {
        let values = document.getElementById(`paramsInput${tx}`).value
        if(values === '') {
          alert('Inputs are empty!')
          return;
        }

        values = values.split(',')
        if(paramsArr.length !== values.length) {
          alert('Fill all params')
          return
        }
        let data = {}
        paramsArr.forEach((p, i) => {
          data[p] = values[i]
        })
        dataPayload.transientData = data
      }

      console.log('DATA PAYLOAD: '); console.log(dataPayload)

      try {
        const resp = await submitTX(true)
        bindResp(resp)
        dataPayload.transientData = undefined
        dataPayload.transactionName = undefined
        dataPayload.connectionID = undefined

      } catch (err) {
        bindResp(err)
        console.error('Something went wrong when submit private transaction', err)
      }

    } else {
      alert('Something went wrong, please reload the page.')
    }
  })

})

fetchChors().then(async (res) => {
  console.log(res)
  chorInstances = res
  const idBpmnFile = chorInstances[0].idModel + ".bpmn"
  const resp = await fetchChorInstanceFile({ idBpmnFile }) // get first file
  await modeler.renderModel(resp.response)
  updateUI()
  whichRoleAmI(chorInstances[0]._id)

  dataPayload = {
    channel: chorInstances[0].channel,
    contractName: chorInstances[0].contractName,
    // contractNamespace: 'choreographyprivatedatacontract', 
    transactionName: chorInstances[0].startEvent
  }

  await connectUser(chorInstances[0].subscriptions, chorInstances[0].roles)
  await queryChorState()

}).catch(error => console.log(error))
