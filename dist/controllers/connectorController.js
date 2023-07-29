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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dynamicModel_1 = require("../models/dynamicModel");
const constant_1 = require("../constant");
const cron_helper_1 = require("../helper/cron.helper");
const mongoose_1 = __importDefault(require("mongoose"));
class ConnectorController {
    createUpdateConnector(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = Object.assign(Object.assign({}, params.query), params.info), info = params.info;
            const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.CONNECTOR);
            const obj = yield dm.findOne({ connectorName: query.connectorName, email: info.email });
            if (!obj) {
                const doc = new dm(query);
                yield doc.save();
                return { msg: "successfully created", error: false };
            }
            else {
                return { msg: `${query.connectorName} already exist!`, error: true };
            }
        });
    }
    insertMultiConnector(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let info = params.info, _date = new Date(), data = params.data.map((p) => (Object.assign(Object.assign(Object.assign({}, info), p), { created_at: _date, updated_at: _date }))).map((_a) => {
                var { tenantCode } = _a, p = __rest(_a, ["tenantCode"]);
                return p;
            });
            const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.CONNECTOR);
            for (let index in data) {
                let obj = data[index];
                const query = { email: obj.email, name: obj.name, display_name: obj.display_name, category: obj.category };
                const res = yield dm.findOne(query).lean();
                if (!res) {
                    const doc = new dm(Object.assign(Object.assign({}, obj), { type: "default" }));
                    yield doc.save();
                }
                else {
                    yield dm.findOneAndUpdate(query, { $set: obj });
                }
            }
            return { msg: "successfully created", error: false };
        });
    }
    connectorList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // const page = parseInt(params.info.page)
                // const limit = parseInt(params.info.limit)
                // const startIndex = (page - 1) * limit;
                // .skip(startIndex).limit(limit)
                let dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(params.info.dbName, constant_1.COLLECTIONS.CONNECTOR);
                resolve(yield dm.find().lean());
            }));
        });
    }
    activateConnector(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, data } = params;
            let dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(params.info.dbName, constant_1.COLLECTIONS.CONNECTOR);
            yield dm.findOneAndUpdate({ role: info.role, email: info.email, display_name: data.display_name }, { $set: { status: data.status, userInputs: data.userInputs } });
            return { error: false };
        });
    }
    shareConnector(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let response;
                const { info, data } = params;
                if (data) {
                    params.data.map((p) => __awaiter(this, void 0, void 0, function* () {
                        const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(p.dbName, constant_1.COLLECTIONS.CONNECTOR);
                        const getEntry = yield dm.findOne({ connectorId: info._id }).lean();
                        const query = { connectorId: info._id, name: info.name, role: constant_1.OTHER.ROLE2, display_name: info.display_name, category: info.category, config: info.config, actions: info.actions, filePath: info.filePath, email: `tenant@${p.domain}`, dbName: p.dbName, tenantCode: p.tenantCode };
                        if (!getEntry) {
                            const doc = new dm(Object.assign(Object.assign({}, query), { created_at: new Date() }));
                            yield doc.save();
                            response = { success: true, status: 200, msg: "Connector assign successfully.", error: false };
                            resolve(response);
                            return;
                        }
                        else {
                            response = { success: false, status: 400, msg: "Connector is already assign to Tenant.", error: true };
                            resolve(response);
                            return;
                        }
                    }));
                }
                else {
                    response = { msg: `Connector assign failed.`, error: true };
                    resolve(response);
                    return;
                }
            });
        });
    }
    tenantDeleteConnector(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let response;
                const { info } = params;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.CONNECTOR);
                const connector = yield dm.findOne({ connectorId: info.connectorId }).lean();
                if (connector) {
                    yield dm.deleteOne({ "connectorId": info.connectorId });
                    const um = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.USERCONNECTOR);
                    yield um.deleteMany({ "connectorId": info.connectorId });
                    response = { success: true, status: 200, msg: `Connector delete successfully.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `Connector not found` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    masterDeleteConnector(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let response;
                const { info } = params;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.TENANT);
                const tenant = yield dm.find().lean();
                tenant.map((p) => __awaiter(this, void 0, void 0, function* () {
                    const bm = (0, dynamicModel_1.dynamicModelWithDBConnection)(p.dbName, constant_1.COLLECTIONS.USERCONNECTOR);
                    yield bm.deleteMany({ "connectorId": info.connectorId });
                    const cm = (0, dynamicModel_1.dynamicModelWithDBConnection)(p.dbName, constant_1.COLLECTIONS.CONNECTOR);
                    yield cm.deleteMany({ "connectorId": info.connectorId });
                }));
                const gm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.CONNECTOR);
                const connector = yield gm.findOne({ _id: info.connectorId }).lean();
                if (connector) {
                    yield gm.deleteOne({ "_id": info.connectorId });
                    response = { success: true, status: 200, msg: `Connector delete successfully.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `Connector not found` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    asignConnector(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let response;
                const { info, data } = params;
                if (data) {
                    params.data.map((p) => __awaiter(this, void 0, void 0, function* () {
                        const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.USERCONNECTOR);
                        const getEntry = yield dm.findOne({ $and: [{ user_id: p._id }, { connectorId: info.connectorId }] }).lean();
                        if (!getEntry) {
                            const query = Object.assign(Object.assign({ user_id: p._id }, info), { role: constant_1.OTHER.ROLE3 });
                            const doc = new dm(Object.assign(Object.assign({}, query), { created_at: new Date() }));
                            yield doc.save();
                            response = { success: true, status: 200, msg: "Connector assign to user successfully.", error: false };
                            resolve(response);
                            return;
                        }
                        else {
                            response = { success: true, status: 400, msg: "Connector is already asign to user.", error: true };
                            resolve(response);
                            return;
                        }
                    }));
                }
                else {
                    response = { msg: `Connector assign failed.`, error: true };
                    resolve(response);
                    return;
                }
            });
        });
    }
    connectorListForUser(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let response;
                let dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(params.dbName, constant_1.COLLECTIONS.USERCONNECTOR);
                const list = yield dm.find({ user_id: params.user_id }).lean();
                if (list.length > 0) {
                    response = { success: true, status: 200, data: list, msg: `User connector list.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `User connector list not found.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    connectorSchedulingDataInsert(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let response;
                    let { info, data } = params;
                    if (!info || !data) {
                        response = {
                            success: false,
                            status: 404,
                            msg: `Bad Request: info & data field is missing`,
                        };
                        resolve(response);
                        return;
                    }
                    let { config, connectorBasePath, connectorFileNameWithExtension } = data;
                    if (!config || !connectorBasePath || !connectorFileNameWithExtension) {
                        response = {
                            success: false,
                            status: 404,
                            msg: `Bad Request: config, connectorBasePath && connectorFileNameWithExtension field is must include in info`,
                        };
                        resolve(response);
                        return;
                    }
                    const ArgType = ['type', 'position', 'isPathArg'];
                    Object.keys(config).forEach((configKey) => {
                        ArgType.forEach((argKey) => {
                            if (!Object.keys(config[configKey]).includes(argKey)) {
                                response = {
                                    success: false,
                                    status: 404,
                                    msg: `Bad Request: ${argKey} field is must include in ${configKey}`,
                                };
                                resolve(response);
                                return;
                            }
                        });
                    });
                    const { dbName, connectorId } = info;
                    if (!dbName || !connectorId) {
                        response = {
                            success: false,
                            status: 404,
                            msg: `Bad Request: dbName & connectorId field is must include in info`,
                        };
                        resolve(response);
                        return;
                    }
                    const dbConnection = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(dbName, constant_1.COLLECTIONS.CONNECTOR_CONFIG);
                    const configData = Object.assign(Object.assign({ connectorId: new mongoose_1.default.Types.ObjectId(connectorId) }, data), { isConnectorScheduled: false, createdAt: new Date(), updatedAt: new Date() });
                    const isConnectorConfigExist = yield dbConnection
                        .find({
                        connectorId: new mongoose_1.default.Types.ObjectId(connectorId),
                    })
                        .lean();
                    if (isConnectorConfigExist.length > 0) {
                        const insertConfigInToCollection = yield dbConnection.findOneAndUpdate({
                            connectorId: new mongoose_1.default.Types.ObjectId(connectorId),
                        }, {
                            $set: Object.assign(Object.assign({}, configData), { createdAt: undefined }),
                        });
                        response = {
                            success: true,
                            status: 200,
                            msg: `Existing connector config updated.`,
                        };
                        resolve(response);
                        return;
                    }
                    else {
                        const insertConfigInToCollection = yield dbConnection(configData);
                        yield insertConfigInToCollection.save();
                        response = {
                            success: true,
                            status: 200,
                            msg: `connector config successfully created.`,
                        };
                        resolve(response);
                        return;
                    }
                }
                catch (e) {
                    const response = {
                        success: true,
                        status: 500,
                        msg: `Error: ${e.message}`,
                    };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    connectorScheduleTest(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let response;
                let { info, data } = params;
                if (!info) {
                    response = {
                        success: false,
                        status: 404,
                        msg: `Bad Request: info field is missing`,
                    };
                    resolve(response);
                    return;
                }
                const { dbName, connectorId, isScheduled } = info;
                const dbConnection = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(dbName, constant_1.COLLECTIONS.CONNECTOR_CONFIG);
                if (isScheduled) {
                    if (!data) {
                        response = {
                            success: false,
                            status: 404,
                            msg: `Bad Request: data field is missing`,
                        };
                        resolve(response);
                        return;
                    }
                    let paramsType = [
                        'minute',
                        'hour',
                        'date',
                        'day',
                        'repeat',
                        'inventory',
                    ];
                    paramsType.forEach((paramsKeyName) => {
                        const isKeyExists = Object.keys(data).includes(paramsKeyName);
                        if (!isKeyExists) {
                            response = {
                                success: false,
                                status: 404,
                                msg: `Bad Request: Field is missing : ${paramsKeyName}`,
                            };
                            resolve(response);
                            return;
                        }
                    });
                    const connectorData = yield dbConnection
                        .findOne({
                        connectorId: new mongoose_1.default.Types.ObjectId(connectorId),
                    })
                        .lean();
                    if (connectorData && connectorData.hasOwnProperty('config')) {
                        let configDataKeys = Object.keys(connectorData.config);
                        configDataKeys.forEach((configKey) => {
                            const isKeyExists = Object.keys(data.config).includes(configKey);
                            if (!isKeyExists) {
                                response = {
                                    success: false,
                                    status: 404,
                                    msg: `Bad Request: Field is missing in inventory : ${configKey}`,
                                };
                                resolve(response);
                                return;
                            }
                        });
                        let responseData = Object.assign(Object.assign({}, info), data);
                        let dataScheduler = [Object.assign({}, data.config)];
                        yield (0, cron_helper_1.connectorTestScheduler)(responseData, dataScheduler);
                        yield dbConnection.findOneAndUpdate({
                            connectorId: new mongoose_1.default.Types.ObjectId(connectorId),
                        }, {
                            $set: {
                                isConnectorScheduled: true,
                                updatedAt: new Date(),
                            },
                        });
                        response = {
                            success: true,
                            status: 200,
                            msg: `connector successfully scheduled.`,
                        };
                        resolve(response);
                        return;
                    }
                }
                else {
                    yield dbConnection.findOneAndUpdate({
                        connectorId: new mongoose_1.default.Types.ObjectId(connectorId),
                    }, {
                        $set: {
                            isConnectorScheduled: false,
                            updatedAt: new Date(),
                        },
                    });
                    let isStopped = yield (0, cron_helper_1.stopTestConnectorScheduler)(connectorId);
                    response = isStopped
                        ? {
                            success: true,
                            status: 200,
                            msg: `connector job stopped.`,
                        }
                        : {
                            success: true,
                            status: 200,
                            msg: `connector job already stopped.`,
                        };
                    resolve(response);
                    return;
                }
                response = {
                    success: false,
                    status: 404,
                    msg: `Bad Request: connector data not found with Id that you provide`,
                };
                resolve(response);
                return;
            }));
        });
    }
    connectorSchedulerStop(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let response;
                let { info, data } = params;
                if (!info || !data) {
                    response = {
                        success: false,
                        status: 404,
                        msg: `Bad Request: info & data field is missing`,
                    };
                    resolve(response);
                    return;
                }
                let { dbName, connectorId, userId } = info;
                const dbConnection = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(dbName, constant_1.COLLECTIONS.CONNECTOR_CONFIG);
            }));
        });
    }
}
exports.default = new ConnectorController();
