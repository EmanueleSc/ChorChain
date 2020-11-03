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

    /**
     * 
     * @param {String} idModel 
     * @param {String} addressCA 
     */
    static async createOrganisationsCrypto(idModel, addressCA) {
        addressCA = addressCA || 'localhost'

        const OrgCAs = NetworkU.getOrgCAsInfo(idModel)

        for(let i = 0; i < OrgCAs.length; i++) {
            const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/createOrg.sh')
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

        for(let i = 0; i < OrgCAs.length; i++) {
            const shFilePath = path.join(__dirname, '../../../../test-network/scripts-app/createOrderer.sh')
            const resp = await command.shExec(shFilePath, [idModel, OrgCAs[i].nameCA, OrgCAs[i].portCA, addressCA])

            console.log(`\n------- CREATE ORDERER ORG IDENTITIES -------`)
            console.log(resp); console.log('\n')
        }
    }

}

// test
const main = async () => {
    await NetworkU.createOrdererCrypto('pippo', 'localhost')
}
main()

module.exports = NetworkU
