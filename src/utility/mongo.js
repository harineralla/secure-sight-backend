const mockEntry = require('./mock-data/data.json')
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const dynamicSchema = new Schema({}, { versionKey: false, strict: false })

const dynamicModelWithDBConnection = (dbName, collectionName) => {
    let dynamicModels = {}
    const url = `mongodb://127.0.0.1:27017/${dbName}`
    let connection = mongoose.createConnection(url, { maxPoolSize: 100 })
    connection.once('open', () => {
        console.log(`Mongodb (${dbName}) called the (${collectionName}) collection!`)
    })
    if (!(collectionName in dynamicModels)) {
        dynamicModels[collectionName] = connection.model(collectionName, dynamicSchema, collectionName)
    }
    return dynamicModels[collectionName]
}

async function enterMock() {
    let dm = dynamicModelWithDBConnection("techm", "connector")
    const doc = new dm(mockEntry)
    await doc.save()
}

enterMock()
