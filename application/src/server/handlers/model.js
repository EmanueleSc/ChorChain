import express from "express"
const router = express.Router()
const path = require('path')
const ChorModel = require("../../db/chormodel")
const NetworkU = require("../utils/networku")
import { ChorTranslator } from '../utils/translator'

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

        // Upload bpmn file
        const fileName = idModel + '.bpmn'
        const uploadPath = path.resolve(__dirname, `../bpmnFiles/${fileName}`)
        bpmnFile.mv(uploadPath, (err) => {
            if (err) return res.status(500).send(err)
        })

        // Create Hyperledger Fabric network
        const bpmnXml = bpmnFile.data.toString('utf8')
        const translator = await new ChorTranslator(bpmnXml, idModel, false)
        const numOrgs = Object.keys(translator.roles).length

        // !!!! PERFORMANCE MEASURE: network creation
        console.time('network creation')
        await NetworkU.networkUp(idModel, numOrgs)
        console.timeEnd('network creation')
        // !!!! END PERFORMANCE MEASURE

        // create choreography model in mongoDB
        const model = await ChorModel.create({
            fileName,
            idModel
        })

        res.json({ response: model })

    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router