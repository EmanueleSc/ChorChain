import express from "express"
const router = express.Router()
const fs = require('fs');
const path = require('path')


router.post('/upload', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.')
        }

        if(req.files.contract) {
            // check if cc_counter.json exists (contract counter file)
            const cc_counterFile = path.resolve(__dirname, `../../../../chaincode/utils/cc_counter.json`)
            let data
            if (fs.existsSync(cc_counterFile)) { // file exists
                data = JSON.parse(fs.readFileSync(cc_counterFile, {encoding:'utf8', flag:'r'}))
                data.counter = data.counter + 1
                fs.writeFileSync(cc_counterFile, JSON.stringify(data))

            } else {  //file not exists
                data = { counter: 1 }
                fs.writeFileSync(cc_counterFile, JSON.stringify(data))
            }

            // write smart contract file inside chaincode
            const code = req.files.contract.data.toString('utf8')
            const chaincodeFile = path.resolve(__dirname, `../../../../chaincode/lib/choreographyprivatedatacontract${data.counter}.js`)
            fs.writeFileSync(chaincodeFile, code)

            // write index.js file inside chaincode
            let header = `\n'use strict';\nconst contracts = [];`
            let body = ''
            let end = 'module.exports.contracts = contracts;'
            const cc_index = path.resolve(__dirname, `../../../../chaincode/index.js`)

            for(let i = 0; i < data.counter; i++) {
                body += `\nconst ChoreographyPrivateDataContract${i+1} = require('./lib/choreographyprivatedatacontract${i+1}.js');\ncontracts.push(ChoreographyPrivateDataContract${i+1});`
            }
            body = header + '\n' + body + '\n' + end
            fs.writeFileSync(cc_index, body)
        }
        
        const file = req.files.bpmn
        const fileName = req.files.bpmn.name
        const uploadPath = path.resolve(__dirname, `../bpmnFiles/${fileName}`)
        

        file.mv(uploadPath, (err) => {
            if (err) {
                return res.status(500).send(err)
            }
            
            res.json({ response: 'File uploaded!' })
        })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router