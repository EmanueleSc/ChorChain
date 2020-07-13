import express from "express"
const router = express.Router()
const ChorInstance = require("../../db/chorinstance")
const path = require('path')
const fs = require('fs')


router.post('/fetch', async (req, res) => {
    try {
        const chors = await ChorInstance.find()

        res.json({ response: chors })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

router.post('/fetch/file', async (req, res) => {
    try {
        const { idBpmnFile } = req.body
        const file = path.resolve(__dirname, `../bpmnFiles/${idBpmnFile}`)
        const xml = fs.readFileSync(file, { encoding:'utf8', flag:'r' })
        res.json({ response: xml })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router