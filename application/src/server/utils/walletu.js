const FabricCAServices = require('fabric-ca-client')
const { Wallets } = require('fabric-network')
const CryptoPeerUser = require('../utils/cryptopeeruser')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

class WalletU {
    constructor() {}
    /**
     * 
     * @param {String} identity | identity label in the wallet
     * @param {String} mspId | (eg. Org1MSP)
     * @param {String} certificate | user crypto certificate
     * @param {String} privateKey | user crypto private key
     * @returns {Wallet} return file system wallet
     */
    static async createIdentity(identity, mspId, certificate, privateKey) {
        try {
            const walletPath = path.resolve(__dirname, `../../../identity/user/${identity}/wallet`)
            const wallet = await Wallets.newFileSystemWallet(walletPath)
            const userExists = await wallet.get(identity)
            if (userExists) {
                console.log(`WARN: An identity for the client user "${identity}" already exists in the wallet`)
            }

            const identityWallet = {
                credentials: { certificate, privateKey },
                mspId,
                type: 'X.509'
            }

            await wallet.put(identity, identityWallet)
            return wallet
        } catch (err) {
            throw new Error({ error: err.message || err.toString() })
        }
    }

    /**
     * 
     * @param {String} identity | identity label in the wallet
     */
    static getWalletPath(identity) {
        const walletPath = path.resolve(__dirname, `../../../identity/user/${identity}/wallet`)
        return walletPath
    }

    /**
     * 
     * @param {String} org | organization domain (eg. org1.example.com)
     * @param {String} ccpFileName | connection profile name (eg. connection-org1.yaml) 
     * @param {String} caHostName | name of CA inside ccp (e.g. ca.org1.example.com)
     * @param {String} identity | wallet user identity label (e.g. Org1MSP{idModel}.{idUser})
     * @param {String} mspId | (eg. Org1MSP{idModel})
     */
    static async registerAndEnrollUserCA(org, ccpFileName, caHostName, identity, mspId) {
        try {
            const ccpPath = CryptoPeerUser.getConnectionProfilePath(org, ccpFileName)
            const ccp = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'))

            const caInfo = ccp.certificateAuthorities[caHostName] //lookup CA details from config
            const caTLSCACerts = caInfo.tlsCACerts.pem
            const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

            const walletPath = WalletU.getWalletPath(identity)
            const wallet = await Wallets.newFileSystemWallet(walletPath)

            // Check to see if we've already enrolled the user
            const userIdentity = await wallet.get(identity)
            if (userIdentity) {
                console.log(`An identity for the user ${identity} already exists in the wallet`)
                return
            }

            // TODO
            // Must use an admin to register a new user
            const adminLabel = `Admin@${org}`
            let adminIdentity = await wallet.get(adminLabel)
            if (!adminIdentity) {
                console.log('Import the admin identity in the wallet')
                const adminCrypto = new CryptoPeerUser(org, adminLabel, 'cert.pem', 'priv_sk')
                const adminWallet = {
                    credentials: { 
                        certificate: adminCrypto.certificate, 
                        privateKey: adminCrypto.privateKey
                    },
                    mspId,
                    type: 'X.509'
                }
                await wallet.put(adminLabel, adminWallet)
                adminIdentity = await wallet.get(adminLabel)
            }

            // build a user object for authenticating with the CA
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type)
            const adminUser = await provider.getUserContext(adminIdentity, adminLabel)

            // Register the user, enroll the user, and import the new identity into the wallet.
            // if affiliation is specified by client, the affiliation value must be configured in CA
            const secret = await caClient.register({
                /*affiliation: affiliation,*/
                enrollmentID: identity,
                role: 'client'
            }, adminUser)

            const enrollment = await caClient.enroll({
                enrollmentID: identity,
                enrollmentSecret: secret
            })

            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspId,
                type: 'X.509',
            }

		    await wallet.put(identity, x509Identity)
		    console.log(`Successfully registered and enrolled user ${identity} and imported it into the wallet`)
            
        } catch (err) {
            console.log(err)
            throw new Error({ error: err.message || err.toString() })
        }
    }
}

module.exports = WalletU
