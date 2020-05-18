const { Wallets } = require('fabric-network')
const path = require('path')

class WalletU {
    constructor() {}
    /**
     * 
     * @param {String} identity | identity label in the wallet
     * @param {String} mspId | (eg. Org1MSP)
     * @param {String} certificate | user crypto certificate
     * @param {String} privateKey | user crypto private key
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
        } catch (err) {
            throw new Error({ error: err.message || err.toString() });
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
}

module.exports = WalletU
