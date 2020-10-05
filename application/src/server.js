import express from "express"
import mongoose from "mongoose"
import compression from "compression"
import bodyParser from 'body-parser'
import xmlparser from 'express-xml-bodyparser'
import path from "path"
import index from "./routes/index"

// APIs
import apiHelloWorld from "./server/handlers/helloworld"
import apiNetwork from "./server/handlers/network"
import apiIdentity from "./server/handlers/identity"
import apiTransaction from "./server/handlers/transaction"
// import apiUpload from "./server/handlers/upload" // DEPRECATED
import apiModel from "./server/handlers/model"
import apiChorInstance from "./server/handlers/chorinstance"
import apiContract from "./server/handlers/contract"

// .env file
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, '../') + '.env' })

// GLOBALS
global.ConnectionProfiles = {} // consider to use e.g. redis

// Connect to MongoDB
const dbURI = process.env.MONGODB_URL
mongoose.connect(dbURI, { useNewUrlParser: true })
// When successfully connected
mongoose.connection.on('connected', () => {
    console.log('info: Mongoose default connection open to: ' + dbURI)
})
// If the connection throws an error
mongoose.connection.on('error', (err) => {
    console.log('error: Mongoose default connection error: ' + err)
})
// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('info: Mongoose default connection disconnected')
})

// Server var
const app = express()

// View engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// Middleware
app.use(compression())
app.use(bodyParser())
app.use(bodyParser.text())
app.use(xmlparser())
console.log(__dirname)
app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/server/bpmnFiles"))
app.use(function(req, res, next) {
    const allowed = [process.env.CHORCHAIN_MODELER_URL, process.env.FABRIC_MODELER_URL]
    const origin = req.headers.origin
    if(allowed.indexOf(origin) >= 0) {
        res.header("Access-Control-Allow-Origin", origin)
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

//File upload middleware
const fileUpload = require('express-fileupload')
app.use(fileUpload())

//Routes
app.use("/", index)
app.use("/api/helloworld", apiHelloWorld)
app.use("/api/network", apiNetwork)
app.use("/api/identity", apiIdentity)
app.use("/api/transaction", apiTransaction)
app.use("/api/contract", apiContract)
// app.use("/api/file", apiUpload) // DEPRECATED
app.use("/api/model", apiModel)
app.use("/api/chorinstance", apiChorInstance)

const port = process.env.PORT || 3000

app.listen(port, function listenHandler() {
    console.info(`Running on ${port}`)
})