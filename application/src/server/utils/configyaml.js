const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const ConfigTx = require('./configtx')

class ConfigYaml {
    constructor() {}

    /**
     * 
     * @param {String} idModel 
     * @param {Number} numOrgs 
     */
    static generateDockerTestNetYaml(idModel, numOrgs) {
        const json = { version: '2', volumes: {}, networks: {}, services: {} }

        const networkName = `net_${idModel}`
        json.networks[networkName] = null

        // orderer
        const orderer = `orderer.${idModel}.com`
        const ordererAddress = '0.0.0.0'
        const ordererPort = ConfigYaml.getAvailablePortOrderer()
        const ordererMSP = `OrdererMSP${idModel}`
        const orgDir = `${idModel}.com`
        const ordDir = `orderer.${idModel}.com`
        json.volumes[orderer] = null
        json.services[orderer] = {
            container_name: orderer,
            image: 'hyperledger/fabric-orderer:$IMAGE_TAG',
            environment: [
                'FABRIC_LOGGING_SPEC=INFO',
                `ORDERER_GENERAL_LISTENADDRESS=${ordererAddress}`,
                `ORDERER_GENERAL_LISTENPORT=${ordererPort}`,
                'ORDERER_GENERAL_GENESISMETHOD=file',
                'ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block',
                `ORDERER_GENERAL_LOCALMSPID=${ordererMSP}`,
                'ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp',
                'ORDERER_GENERAL_TLS_ENABLED=true',
                'ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key',
                'ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt',
                'ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]',
                'ORDERER_KAFKA_TOPIC_REPLICATIONFACTOR=1',
                'ORDERER_KAFKA_VERBOSE=true',
                'ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/var/hyperledger/orderer/tls/server.crt',
                'ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/var/hyperledger/orderer/tls/server.key',
                'ORDERER_GENERAL_CLUSTER_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]'
            ],
            working_dir: '/opt/gopath/src/github.com/hyperledger/fabric',
            command: 'orderer',
            volumes: [
                '../system-genesis-block/genesis.block:/var/hyperledger/orderer/orderer.genesis.block',
                `../organizations/ordererOrganizations/${orgDir}/orderers/${ordDir}/msp:/var/hyperledger/orderer/msp`,
                `../organizations/ordererOrganizations/${orgDir}/orderers/${ordDir}/tls/:/var/hyperledger/orderer/tls`,
                `${ordDir}:/var/hyperledger/production/orderer`
            ],
            ports: [`${ordererPort}:${ordererPort}`],
            networks: [networkName]
        }

        // peers
        for(let i = 1; i <= numOrgs; i++) {
            const orgCount = i
            const peer = `peer0.org${orgCount}.${idModel}.com`
            const ports = ConfigYaml.getAvailablePortsPeer()
            const peerPort = ports.peerPort
            const peerChaincodePort = ports.chaincodePort
            const peerAddress = '0.0.0.0'
            const peerOrgMSP = `Org${orgCount}MSP${idModel}`
            const peerOrgDir = `org${orgCount}.${idModel}.com`

            json.volumes[peer] = null
            json.services[peer] = {
                container_name: peer,
                image: 'hyperledger/fabric-peer:$IMAGE_TAG',
                environment: [
                    'CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock',
                    'CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${COMPOSE_PROJECT_NAME}_test',
                    'FABRIC_LOGGING_SPEC=INFO',
                    'CORE_PEER_TLS_ENABLED=true',
                    'CORE_PEER_GOSSIP_USELEADERELECTION=true',
                    'CORE_PEER_GOSSIP_ORGLEADER=false',
                    'CORE_PEER_PROFILE_ENABLED=true',
                    'CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt',
                    'CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key',
                    'CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt',
                    `CORE_PEER_ID=${peer}`,
                    `CORE_PEER_ADDRESS=${peer}:${peerPort}`,
                    `CORE_PEER_LISTENADDRESS=${peerAddress}:${peerPort}`,
                    `CORE_PEER_CHAINCODEADDRESS=${peer}:${peerChaincodePort}`,
                    `CORE_PEER_CHAINCODELISTENADDRESS=${peerAddress}:${peerChaincodePort}`,
                    `CORE_PEER_GOSSIP_BOOTSTRAP=${peer}:${peerPort}`,
                    `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peer}:${peerPort}`,
                    `CORE_PEER_LOCALMSPID=${peerOrgMSP}`
                ],
                volumes: [
                    '/var/run/:/host/var/run/',
                    `../organizations/peerOrganizations/${peerOrgDir}/peers/${peer}/msp:/etc/hyperledger/fabric/msp`,
                    `../organizations/peerOrganizations/${peerOrgDir}/peers/${peer}/tls:/etc/hyperledger/fabric/tls`,
                    `${peer}:/var/hyperledger/production`
                ],
                working_dir: '/opt/gopath/src/github.com/hyperledger/fabric/peer',
                command: 'peer node start',
                ports: [`${peerPort}:${peerPort}`],
                networks: [networkName]
            }
        } 

        // write docker-compose-test-net file inside test-network
        const dockerFilePath = path.resolve(__dirname, `../../../../test-network/docker/docker-compose-test-net-${idModel}.yaml`)
        const yamlStr = yaml.safeDump(json)
        fs.writeFileSync(dockerFilePath, yamlStr, 'utf8')
    }

    /**
     * 
     * @param {String} idModel
     * @param {Number} numOrgs 
     */
    static generateDockerCaYaml(idModel, numOrgs) {
        const json = { version: '2', networks: {}, services: {} }

        const networkName = `net_${idModel}`
        json.networks[networkName] = null

        // one Fabric CA per organisation
        for(let i = 1; i <= numOrgs; i++) {
            const caOrg = `ca_org${i}_${idModel}`
            const portOrg = ConfigYaml.getAvailablePortCA()
            const caOrgFolderPath = `../organizations/fabric-ca/org${i}-${idModel}`

            json.services[caOrg] = {
                image: 'hyperledger/fabric-ca:$IMAGE_TAG',
                environment: [
                    'FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server',
                    `FABRIC_CA_SERVER_CA_NAME=${caOrg}`,
                    'FABRIC_CA_SERVER_TLS_ENABLED=true',
                    `FABRIC_CA_SERVER_PORT=${portOrg}`
                ],
                ports: [`${portOrg}:${portOrg}`],
                command: 'sh -c "fabric-ca-server start -b admin:adminpw -d"',
                volumes: [`${caOrgFolderPath}:/etc/hyperledger/fabric-ca-server`],
                container_name: caOrg,
                networks: [networkName] 
            }
        }

        // one Fabric CA for the orderer
        const caOrderer = `ca_orderer_${idModel}`
        const portOrderer = ConfigYaml.getAvailablePortCA()
        const caOrdererFolderPath = `../organizations/fabric-ca/ordererOrg-${idModel}`
        json.services[caOrderer] = {
            image: 'hyperledger/fabric-ca:$IMAGE_TAG',
            environment: [
                'FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server',
                `FABRIC_CA_SERVER_CA_NAME=${caOrderer}`,
                'FABRIC_CA_SERVER_TLS_ENABLED=true',
                `FABRIC_CA_SERVER_PORT=${portOrderer}`
            ],
            ports: [`${portOrderer}:${portOrderer}`],
            command: 'sh -c "fabric-ca-server start -b admin:adminpw -d"',
            volumes: [`${caOrdererFolderPath}:/etc/hyperledger/fabric-ca-server`],
            container_name: caOrderer,
            networks: [networkName]
        }

        // write docker-compose-ca file inside test-network
        const dockerFilePath = path.resolve(__dirname, `../../../../test-network/docker/docker-compose-ca-${idModel}.yaml`)
        const yamlStr = yaml.safeDump(json)
        fs.writeFileSync(dockerFilePath, yamlStr, 'utf8')
    }

    static getAvailablePortsPeer() {
        // peers need two ports (peer port and chaincode port)
        // for peers we start from 7051
        const startPeerPort = 7051
        const startChaincodePort = startPeerPort + 1

        const filePath = path.resolve(__dirname, `./usedPorts.json`)
        if(fs.existsSync(filePath)) {
            let data = JSON.parse(fs.readFileSync(filePath, {encoding:'utf8', flag:'r'}))

            if(data.Peers.length === 0) {
                data.Peers.push(startPeerPort)
                data.Peers.push(startChaincodePort)
                fs.writeFileSync(filePath, JSON.stringify(data))
                return {
                    peerPort: startPeerPort,
                    chaincodePort: startChaincodePort
                }
            }

            const len = data.Peers.length
            const last = data.Peers[len - 1]
            const peerPort = last + 1
            const chaincodePort = peerPort + 1
            data.Peers.push(peerPort)
            data.Peers.push(chaincodePort)
            fs.writeFileSync(filePath, JSON.stringify(data))
            return { peerPort, chaincodePort }

        } else { // file not exists
            const data = {
                CAs: [],
                Peers: [startPeerPort, startChaincodePort],
                Orderers: []
            }
            fs.writeFileSync(filePath, JSON.stringify(data))
            return {
                peerPort: startPeerPort,
                chaincodePort: startChaincodePort
            }
        }
    }


    static getAvailablePortCA() {
        // for CAs we start from the 9051
        const startCAPort = 9051
        
        const filePath = path.resolve(__dirname, `./usedPorts.json`)
        if(fs.existsSync(filePath)) {
            let data = JSON.parse(fs.readFileSync(filePath, {encoding:'utf8', flag:'r'}))

            if(data.CAs.length === 0) {
                data.CAs.push(startCAPort)
                fs.writeFileSync(filePath, JSON.stringify(data))
                return startCAPort
            }

            const len = data.CAs.length
            const last = data.CAs[len - 1]
            const port = last + 1
            data.CAs.push(port)
            fs.writeFileSync(filePath, JSON.stringify(data))
            return port


        } else { // file not exists
            const data = {
                CAs: [startCAPort],
                Peers: [],
                Orderers: []
            }
            fs.writeFileSync(filePath, JSON.stringify(data))
            return startCAPort
        }
    }

    static getAvailablePortOrderer() {
        // for Orderers we start from the 11051
        const startOrdererPort = 11051
        
        const filePath = path.resolve(__dirname, `./usedPorts.json`)
        if(fs.existsSync(filePath)) {
            let data = JSON.parse(fs.readFileSync(filePath, {encoding:'utf8', flag:'r'}))

            if(data.Orderers.length === 0) {
                data.Orderers.push(startOrdererPort)
                fs.writeFileSync(filePath, JSON.stringify(data))
                return startOrdererPort
            }

            const len = data.Orderers.length
            const last = data.Orderers[len - 1]
            const port = last + 1
            data.Orderers.push(port)
            fs.writeFileSync(filePath, JSON.stringify(data))
            return port


        } else { // file not exists
            const data = {
                CAs: [],
                Peers: [],
                Orderers: [startOrdererPort]
            }
            fs.writeFileSync(filePath, JSON.stringify(data))
            return startOrdererPort
        }
    }

    static getYamlObj(filePath) {
        const doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
        return doc
    }

    static generateConfigTxYaml(idModel, orderers, peers) {
        let ordererPort = orderers[0].ordererPort

        let peer0Ports = []
        peers.forEach(p => {
            peer0Ports.push(p.peer0Port)
        })

        const configtxobj = new ConfigTx(idModel, ordererPort, peer0Ports)

        console.log('JSON: ')
        console.log(configtxobj)

        console.log('YAML:')
        console.log(yaml.safeDump(configtxobj))


        /*const configtx = path.join(__dirname, `../../../../test-network/configtx/configtx.yaml`)
        const obj = ConfigYaml.getYamlObj(configtx)
        console.log(obj)*/
    }

}

module.exports = ConfigYaml
