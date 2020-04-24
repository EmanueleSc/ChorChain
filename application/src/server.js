import express from "express";
import compression from "compression";
import path from "path";
import index from "./routes/index";

// APIs
import apiHelloWorld from "./server/handlers/helloworld";
import apiNetwork from "./server/handlers/network";

// .env file
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../') + '.env' });

// Server var
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(compression());
console.log(__dirname);
app.use(express.static(__dirname + "/public"));

//Routes
app.use("/", index);
app.use("/api/helloworld", apiHelloWorld);
app.use("/api/network", apiNetwork);

const port = process.env.PORT || 3000;

app.listen(port, function listenHandler() {
    console.info(`Running on ${port}`)
});