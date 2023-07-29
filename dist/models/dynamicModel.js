"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicModelWithDBConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const dynamicSchema = new Schema({}, { versionKey: false, strict: false, minimize: false });
const dynamicModelWithDBConnection = (dbName, collectionName) => {
    let dynamicModels = {};
    const url = `${process.env.mongo_base_url}/${dbName}`;
    let connection = mongoose_1.default.createConnection(url, { maxPoolSize: 10 });
    connection.once('open', () => {
        console.log(`Mongodb (${dbName}) called the (${collectionName}) collection!`);
    });
    if (!(collectionName in dynamicModels)) {
        dynamicModels[collectionName] = connection.model(collectionName, dynamicSchema, collectionName);
    }
    return dynamicModels[collectionName];
};
exports.dynamicModelWithDBConnection = dynamicModelWithDBConnection;
// let dynamicModels: any = {};
// export const dynamicModel = (collectionName: string) => {
//     if (!(collectionName in dynamicModels)) {
//         dynamicModels[collectionName] = mongoose.model(collectionName, dynamicSchema, collectionName);
//     }
//     return dynamicModels[collectionName];
// }
