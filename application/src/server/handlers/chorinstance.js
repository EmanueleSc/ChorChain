import express from "express"
const router = express.Router()
const ChorInstance = require("../../db/chorinstance")
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')


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

router.get('/subscribe', async (req, res) => {
    try {
        const { idUser, idChor, subRole } = req.query
        
        let chorinstance = await ChorInstance.findOne({ idChor: idChor }).exec()
        if(!chorinstance) {
            return res.status(404).send('Chor instance document not found.')
        }

        let idUsersSubscribed = chorinstance.idUsersSubscribed
        const roles = chorinstance.roles
        let subscriptions = chorinstance.subscriptions

        // Ensures that the maximum number of subscriptions is not exceeded
        if(idUsersSubscribed.length === Object.keys(roles).length) {
            return res.status(405).send('Maximum number of subscriptions exceeded.')
        }

        // Ensure that the subscribed role exists in the choreography instance
        if(!(subRole in roles) && !(subRole in subscriptions)) {
            return res.status(405).send('Role not exists in the choreography instance.')
        }

        // Ensure that the role is not already subscribed
        if(subscriptions[subRole] !== null) {
            return res.status(405).send('Role already subscribed, operation not allowed.')
        }

        // Update document: user subscription to the specific role
        idUsersSubscribed.push(mongoose.Types.ObjectId(idUser))
        subscriptions[subRole] = idUser

        const response = await ChorInstance.update(
            { _id: chorinstance._id },
            { $set: { idUsersSubscribed, subscriptions } }
        )


        res.json({ response })
    } catch (err) {
        res.json({ error: err.message || err.toString() })
    }
})

module.exports = router