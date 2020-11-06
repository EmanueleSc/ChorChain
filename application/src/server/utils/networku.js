const path = require('path')
const command = require('../utils/command')
const ConfigYaml = require('../utils/configyaml')

class NetworkU {
    constructor() {}

    /**
     * 
     * @param {String} idModel 
     * @param {Number} numOrgs 
     */
    static async CAsUp(idModel, numOrgs) {
        ConfigYaml.generateDockerCaYaml(idModel, numOrgs)
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/dockerComposeCA.sh')
        const composeCAFile = `docker-compose-ca-${idModel}.yaml`
        const resp = await command.shExec(shFilePath, [composeCAFile])

        console.log('\n------- GENERATE CAs FILE AND RUN CAs -------')
        console.log(resp); console.log('\n')
    }

    static getOrgCAsInfo(idModel) {
        const composeCAFile = path.join(__dirname, `../../../../test-network/docker/docker-compose-ca-${idModel}.yaml`)
        const yaml = ConfigYaml.getYamlObj(composeCAFile)
        const CAs = yaml.services
        let res = []
        let i = 1
        for (let key in CAs) {
            if (key.includes('org')) {
                res.push({
                    numOrg: i,
                    nameCA: key,
                    portCA: CAs[key].ports[0].split(':')[0]
                })
                i++
            }
        }
        return res
    }

    static getOrdererOrgCAsInfo(idModel) {
        const composeCAFile = path.join(__dirname, `../../../../test-network/docker/docker-compose-ca-${idModel}.yaml`)
        const yaml = ConfigYaml.getYamlObj(composeCAFile)
        const CAs = yaml.services
        let res = []
        for (let key in CAs) {
            if (key.includes('orderer')) {
                res.push({
                    nameCA: key,
                    portCA: CAs[key].ports[0].split(':')[0]
                })
            }
        }
        return res
    }

    static getPeer0sInfo(idModel) {
        const composeCAFile = path.join(__dirname, `../../../../test-network/docker/docker-compose-test-net-${idModel}.yaml`)
        const yaml = ConfigYaml.getYamlObj(composeCAFile)
        const orgs = yaml.services
        let res = []
        for (let key in orgs) {
            if (key.includes('peer0.org')) {
                res.push({
                    peer0Name: key,
                    peer0Port: orgs[key].ports[0].split(':')[0]
                })
            }
        }
        return res
    }

    static getOrderersInfo(idModel) {
        const composeCAFile = path.join(__dirname, `../../../../test-network/docker/docker-compose-test-net-${idModel}.yaml`)
        const yaml = ConfigYaml.getYamlObj(composeCAFile)
        const orgs = yaml.services
        let res = []
        for (let key in orgs) {
            if (key.includes('orderer')) {
                res.push({
                    ordererName: key,
                    ordererPort: orgs[key].ports[0].split(':')[0]
                })
            }
        }
        return res
    }

    /**
     * 
     * @param {String} idModel 
     * @param {String} addressCA 
     */
    static async createOrganisationsCrypto(idModel, addressCA) {
        addressCA = addressCA || 'localhost'

        const OrgCAs = NetworkU.getOrgCAsInfo(idModel)
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/createOrg.sh')

        for(let i = 0; i < OrgCAs.length; i++) {
            const resp = await command.shExec(shFilePath, [OrgCAs[i].numOrg, idModel, OrgCAs[i].nameCA, OrgCAs[i].portCA, addressCA])

            console.log(`\n------- CREATE ORGANISATION ${OrgCAs[i].numOrg} IDENTITIES -------`)
            console.log(resp); console.log('\n')
        }
    }

    /**
     * 
     * @param {String} idModel 
     * @param {String} addressCA 
     */
    static async createOrdererCrypto(idModel, addressCA) {
        addressCA = addressCA || 'localhost'

        const OrgCAs = NetworkU.getOrdererOrgCAsInfo(idModel)
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/createOrderer.sh')

        for(let i = 0; i < OrgCAs.length; i++) {
            const resp = await command.shExec(shFilePath, [idModel, OrgCAs[i].nameCA, OrgCAs[i].portCA, addressCA])

            console.log(`\n------- CREATE ORDERER ORG IDENTITIES -------`)
            console.log(resp); console.log('\n')
        }
    }

    /**
     * 
     * @param {String} idModel 
     */
    static async createCCPs(idModel) {
        const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/ccpGenerate.sh')
        const peers = NetworkU.getPeer0sInfo(idModel)
        const CAs = NetworkU.getOrgCAsInfo(idModel)

        for(let i = 0; i < peers.length; i++) {
            const orgCount = i + 1
            const resp = await command.shExec(shFilePath, [orgCount, idModel, peers[i].peer0Port, CAs[i].portCA])

            console.log(`\n------- CREATE CCP FOR PEER0 ORG${orgCount} -------`)
            console.log(resp); console.log('\n')
        }
    }

    static async netUp(idModel) {
        // create consortium
        const peers = NetworkU.getPeer0sInfo(idModel)
        const orderers = NetworkU.getOrderersInfo(idModel)
        ConfigYaml.generateConfigTxYaml(idModel, orderers, peers)
    }

}

// test
const main = async () => {
    await NetworkU.netUp('pippo')
}
main()

module.exports = NetworkU
