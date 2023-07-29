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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareDefaultConnectors = exports.createUpdateClientDb = exports.createDynamicConnection = exports.updateDbName = void 0;
const fs = require('fs');
const path = require('path');
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/client/user"));
const index_1 = require("../constant/index");
const dynamicModel_1 = require("../models/dynamicModel");
const updateDbName = (params) => {
    let dbName = params.companyName.toLowerCase().replace(/\s+/g, '');
    return Object.assign(Object.assign({}, params), { dbName });
};
exports.updateDbName = updateDbName;
const createDynamicConnection = (obj) => {
    const url = `${process.env.mongo_base_url}/${obj.dbName}` || "";
    return mongoose_1.default.createConnection(url);
};
exports.createDynamicConnection = createDynamicConnection;
const createUpdateClientDb = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = (0, exports.createDynamicConnection)(obj);
    const userModel = connection.model('users', user_1.default);
    const doc = Object.assign(Object.assign({}, obj), { fullName: "", email: `tenant@${obj.domain}`, password: process.env.default_tenant_email_password, role: index_1.OTHER.ROLE2 });
    const query = { tenantCode: doc.tenantCode, email: doc.email, role: doc.role };
    const user = yield userModel.findOne(query);
    if (!user) {
        const model = new userModel(doc);
        yield model.save();
    }
    else {
        yield userModel.findOneAndUpdate(query, doc);
    }
});
exports.createUpdateClientDb = createUpdateClientDb;
const shareDefaultConnectors = (obj, info) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        const master = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, index_1.COLLECTIONS.CONNECTOR);
        let arr = yield master.find({ role: info.role, email: info.email, dbName: info.dbName, type: "default" }, { _id: 0 }).lean();
        //const localDirPath: string = path.resolve(process.env.PWD, `../../connector_storage/${obj.dbName}/tenant@${obj.domain}`)
        const tenant_connector = arr.map((val, index) => (Object.assign(Object.assign({}, val), { role: index_1.OTHER.ROLE2, email: `tenant@${obj.domain}`, dbName: obj.dbName })));
        const tenant = (0, dynamicModel_1.dynamicModelWithDBConnection)(obj.dbName, index_1.COLLECTIONS.CONNECTOR);
        for (let index in tenant_connector) {
            const obj2 = tenant_connector[index];
            const query = { email: obj2.email, display_name: obj2.display_name, role: index_1.OTHER.ROLE2, dbName: obj2.dbName };
            const res = yield tenant.findOne(query);
            if (!res) {
                const doc = new tenant(obj2);
                yield doc.save();
            }
            else {
                tenant.findOneAndUpdate(query, { $set: obj2 });
            }
        }
        // if (!fs.existsSync(localDirPath)) {
        //     fs.mkdirSync(localDirPath, { recursive: true })
        // }
        resolve({});
    }));
});
exports.shareDefaultConnectors = shareDefaultConnectors;
