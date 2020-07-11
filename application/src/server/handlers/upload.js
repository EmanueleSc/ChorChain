import express from "express"
const router = express.Router()
const path = require('path')


router.post('/upload', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.')
        }
        
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        const file = req.files.bpmn
        const fileName = req.files.bpmn.name
        const uploadPath = path.resolve(__dirname, `../bpmnFiles/${fileName}`);
        

        file.mv(uploadPath, (err) => {
            if (err) {
                return res.status(500).send(err)
            }
            
            res.send('File uploaded!')
        })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router