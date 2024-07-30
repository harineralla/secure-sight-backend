"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const dynamicModel_1 = require("../models/dynamicModel");
const constant_1 = require("../constant");
class UploadConnectorController {
    uploadConnector(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, currentChunkIndex, totalChunks, email, dbName, nameWithoutExtension, display_name, category } = req.query;
            const localDirPath = path.resolve(process.env.PWD, `../secure-sight-scheduler/server`);
            // const localDirPath = path.resolve(process.env.PWD, `../orion-scheduler/server`)
            const firstChunk = parseInt(currentChunkIndex) === 0;
            const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
            const data = req.body.toString().split(',')[1] || 'dummy content';
            const buffer = Buffer.from(data, 'base64');
            const tmpFilename = name;
            const filePath = `${localDirPath}/${tmpFilename}`;
            if (!fs.existsSync(localDirPath)) {
                fs.mkdirSync(localDirPath, { recursive: true });
            }
            if (firstChunk && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            fs.appendFileSync(filePath, buffer);
            if (lastChunk) {
                if ((parseInt(totalChunks) - 1) === parseInt(currentChunkIndex)) {
                    const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(dbName, constant_1.COLLECTIONS.CONNECTOR);
                    const query = { email, name: nameWithoutExtension, display_name, category };
                    const obj = yield dm.findOne(query);
                    if (obj) {
                        yield dm.findOneAndUpdate(query, { $set: { filePath, updated_at: new Date() } });
                    }
                }
                return { msg: 'processing', tmpFilename };
            }
            else {
                return { msg: 'Connector upload failed' };
            }
        });
    }
}
exports.default = new UploadConnectorController();
