"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_graphql_1 = require("express-graphql");
const passport_1 = __importDefault(require("passport"));
const cors = require('cors');
// import { CompareDate } from './middleware/auth'
const cron_helper_1 = __importDefault(require("./helper/cron.helper"));
require('dotenv').config();
const schema_1 = __importDefault(require("./schema/schema"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(cors());
const routes_1 = __importDefault(require("./routes"));
/*********************** Body Parser ********************************************/
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.raw({ type: 'application/octet-stream', limit: '100mb' }));
/*******************************************************************************/
/*********************** Passport Config **************************************/
app.use(passport_1.default.initialize());
require('./utils/passport')(passport_1.default);
/******************************************************************************/
const cronJobEmailSender = new cron_helper_1.default();
cronJobEmailSender.schedule.start();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
/*************************** API Caller **************************************/
app.use('/api', routes_1.default);
/*****************************************************************************/
/************************* Mongo DB *******************************************/
let CONNECTION_STRING = `${process.env.mongo_base_url}/${process.env.mongo_db}` || "";
mongoose_1.default.connect(CONNECTION_STRING);
mongoose_1.default.connection.once('open', () => {
    console.log(`Connection to database has been established successfully ${CONNECTION_STRING}`);
});
/******************************************************************************/
/******************************************************************************/
app.use('/graphql', (0, express_graphql_1.graphqlHTTP)({
    schema: schema_1.default,
    graphiql: true
}));
/******************************************************************************/
/********************* ENV PROD & DEV **************************************/
if (process.env.NODE_ENV == 'prod') {
    app.use(express_1.default.static(path_1.default.resolve(__dirname, "../../client/build")));
    app.get('/*', function (_req, res) {
        res.sendFile(path_1.default.resolve(__dirname, "../../client/build/index.html"));
    });
}
/****************************************************************************/
app.listen(5000, () => console.log("server running 5000"));
