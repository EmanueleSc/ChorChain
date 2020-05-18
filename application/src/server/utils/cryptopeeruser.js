const fs = require('fs')
const path = require('path')
const fixtures = path.resolve(__dirname, '../../../../test-network')

class CryptoPeerUser {
    /**
     * @param {String} org | organization domain (eg. org1.example.com)
     * @param {String} user | user domain (eg. User1@org1.example.com)
     * @param {String} mspUserSignCert | MSP user sign certificate (eg. User1@org1.example.com-cert.pem)
     * @param {String} mspUserPrivKey | MSP user private key (eg. priv_sk)
     */
    constructor(org, user, mspUserSignCert, mspUserPrivKey) {
        const credPath = path.join(fixtures, `/organizations/peerOrganizations/${org}/users/${user}`)
        this.certificate = fs.readFileSync(path.join(credPath, `/msp/signcerts/${mspUserSignCert}`)).toString()
        this.privateKey = fs.readFileSync(path.join(credPath, `/msp/keystore/${mspUserPrivKey}`)).toString()
    }

    /**
     * @param {String} org | organization domain (eg. org1.example.com)
     * @param {String} ccpFileName | connection profile name (eg. connection-org1.yaml) 
     */
    static getConnectionProfilePath(org, ccpFileName){
        const path = require('path').join(fixtures, `/organizations/peerOrganizations/${org}/${ccpFileName}`)
        return path
    }

    /**
     * 
     * @param {String} orderer | (eg. example.com)
     * @param {String} domain  | (eg. orderer.example.com)
     */
    static getOrdererPath(orderer, domain){
        const ordererPath = require('path').join(fixtures, `/organizations/ordererOrganizations/${orderer}/orderers/${domain}`)
        return ordererPath
    }

    /**
     * 
     * @param {String} orderer | (eg. example.com)
     * @param {String} domain | (eg. orderer.example.com)
     * @param {String} mspTlsCaCert | (eg. tlsca.example.com-cert.pem)
     */
    static getOrdererTlsCert(orderer, domain, mspTlsCaCert) {
        const ordererPath = this.getOrdererPath(orderer, domain)
        const ordererTlsCert = fs.readFileSync(path.join(ordererPath, `/msp/tlscacerts/${mspTlsCaCert}`)).toString()
        return ordererTlsCert
    }

    /**
     * 
     * @param {String} org | organization domain (eg. org1.example.com)
     * @param {String} peer | peer domain (eg. peer0.org1.example.com)
     */
    static getPeerPath(org, peer) {
        const peerPath = require('path').join(fixtures, `/organizations/peerOrganizations/${org}/peers/${peer}`)
        return peerPath
    }

    /**
     * 
     * @param {String} org | organization domain (eg. org1.example.com)
     * @param {String} mspTlsCaCert | mspTlsCaCert | (eg. tlsca.org1.example.com-cert.pem)
     */
    static getPeerOrgTlsCert(org, peer, mspTlsCaCert) {
        const peerPath = this.getPeerPath(org, peer)
        const peerTlsCert = fs.readFileSync(path.join(peerPath, `/msp/tlscacerts/${mspTlsCaCert}`)).toString()
        return peerTlsCert
    }
}

module.exports = CryptoPeerUser
