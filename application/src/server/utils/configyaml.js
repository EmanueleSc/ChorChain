const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

class ConfigYaml {
    constructor() {}

    /**
     * 
     * @param {String} idModel
     * @param {Number} numOrgs 
     */
    static async generateDockerCaYaml(idModel, numOrgs) {
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

}

// test 
// ConfigYaml.generateDockerCaYaml('idModel', 3)

module.exports = ConfigYaml
