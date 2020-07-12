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
            const code = req.files.contract.data.toString('utf8')
            const chaincodeFile = path.resolve(__dirname, `../../../../chaincode/lib/choreographyprivatedatacontract.js`)
            fs.writeFileSync(chaincodeFile, code)
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