import express from "express"
const router = express.Router()
const path = require('path')
const ChorModel = require("../../db/chormodel")

router.post('/upload', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.')
        }

        if (!req.files.bpmn) {
            return res.status(400).send('No bpmn were uploaded.')
        }

        const bpmnFile = req.files.bpmn
        const idModel = req.body.idModel
        const modelName = req.body.modelName
        const idUser = req.body.idUser

        // Upload bpmn file
        const fileName = idModel + '.bpmn'
        const uploadPath = path.resolve(__dirname, `../bpmnFiles/${fileName}`)
        bpmnFile.mv(uploadPath, (err) => {
            if (err) return res.status(500).send(err)
        })

        // create choreography model in mongoDB
        const model = await ChorModel.create({
            fileName,
            modelName,
            idUser,
            idModel
        })

        res.json({ response: model })

    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router