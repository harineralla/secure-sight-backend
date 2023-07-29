import path from 'path'
import mongoose from 'mongoose'
import { graphqlHTTP } from 'express-graphql'
import passport from 'passport'
const cors = require('cors');
// import { CompareDate } from './middleware/auth'
import cronScheduler from './helper/cron.helper'

require('dotenv').config()
import schema from './schema/schema'
import express, { Application, Request, Response, NextFunction, Errback } from 'express'
const app: Application = express()
app.use(cors())
import routes from './routes'

/*********************** Body Parser ********************************************/
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '100mb' }));
/*******************************************************************************/

/*********************** Passport Config **************************************/
app.use(passport.initialize())
require('./utils/passport')(passport)
/******************************************************************************/
const cronJobEmailSender = new cronScheduler()
cronJobEmailSender.schedule.start()
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
/*************************** API Caller **************************************/
app.use('/api', routes)
/*****************************************************************************/

/************************* Mongo DB *******************************************/
let CONNECTION_STRING: string = `${process.env.mongo_base_url}/${process.env.mongo_db}` || ""
mongoose.connect(CONNECTION_STRING)
mongoose.connection.once('open', () => {
    console.log(`Connection to database has been established successfully ${CONNECTION_STRING}`)
})
/******************************************************************************/

/******************************************************************************/
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))
/******************************************************************************/

/********************* ENV PROD & DEV **************************************/
if (process.env.NODE_ENV == 'prod') {
    app.use(express.static(path.resolve(__dirname, "../../client/build")))
    app.get('/*', function (_req: Request, res: Response) {
        res.sendFile(path.resolve(__dirname, "../../client/build/index.html"))
    })
}
/****************************************************************************/
app.listen(5000, () => console.log("server running 5000"))
