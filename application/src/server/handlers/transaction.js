import express from "express"
const router = express.Router()
const { Gateway } = require('fabric-network')

router.post('/submit', async (req, res) => {
    try {
        const { connectionID, channel, contractNamespace, contractName, transactionName, transactionParams } = req.body
        const gateway = new Gateway()
        const conn = global.ConnectionProfiles[connectionID]
        await gateway.connect(conn.connectionProfile, conn.connectionOptions)

        const network = await gateway.getNetwork(channel)
        const contract = await network.getContract(contractNamespace, contractName)
        let resp = null

        if(!transactionParams || transactionParams === '')
            resp = await contract.submitTransaction(transactionName)
        else
            resp = await contract.submitTransaction(transactionName, transactionParams)
        
        gateway.disconnect()
        res.json({ response: resp })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

router.post('/submit/private', async (req, res) => {
    try {
        const { connectionID, channel, contractNamespace, contractName, transactionName, transientData } = req.body
        const gateway = new Gateway()
        const conn = global.ConnectionProfiles[connectionID]
        await gateway.connect(conn.connectionProfile, conn.connectionOptions)
        const network = await gateway.getNetwork(channel)
        const contract = await network.getContract(contractNamespace, contractName)
        let resp = null
        
        // Private data sent as transient data: { [key: string]: Buffer }
        // example
        /* const transientData = {
            marblename: Buffer.from('marble1'),
            color: Buffer.from('red'),
            owner: Buffer.from('John'),
            size: Buffer.from('85'),
            price: Buffer.from('99')
        } */
        console.log('\n<====================== API: /submit/private CALLED')
        console.log(transientData)
        console.log(typeof transientData)

        if(transientData && transientData !== '') {
            if(typeof transientData !== 'object') {
                transientData = JSON.stringify(transientData)
                console.log('--- STRINGIFY ---')
                console.log(transientData)

                transientData = JSON.parse(transientData)
                console.log('--- PARSE ---')
                console.log(transientData)
            }

            for (let [key, value] of Object.entries(transientData)) {
                const str = String(value);

                console.log('VALUE')
                console.log(str)

                transientData[key] = Buffer.from(str);
            }
    
            resp = await contract.createTransaction(transactionName)
                .setTransient(transientData)
                .submit()
        } else {
            resp = await contract.createTransaction(transactionName).submit()
        }
        

        gateway.disconnect()
        res.json({ response: resp })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router