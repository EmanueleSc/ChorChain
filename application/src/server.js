import express from "express";
import compression from "compression";
import bodyParser from 'body-parser';
import path from "path";
import index from "./routes/index";

// APIs
import apiHelloWorld from "./server/handlers/helloworld";
import apiNetwork from "./server/handlers/network";
import apiIdentity from "./server/handlers/identity";
import apiTransaction from "./server/handlers/transaction"

// .env file
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../') + '.env' });

// GLOBALS
global.ConnectionProfiles = {}; // consider to use e.g. redis

// Server var
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(compression());
app.use(bodyParser());
console.log(__dirname);
app.use(express.static(__dirname + "/public"));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:9013"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Routes
app.use("/", index);
app.use("/api/helloworld", apiHelloWorld);
app.use("/api/network", apiNetwork);
app.use("/api/identity", apiIdentity);
app.use("/api/transaction", apiTransaction);

const port = process.env.PORT || 3000;

app.listen(port, function listenHandler() {
    console.info(`Running on ${port}`)
});