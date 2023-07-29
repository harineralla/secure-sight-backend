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
const dynamicModel_1 = require("../../models/dynamicModel");
const tenantUtil_1 = require("../../utils/tenantUtil");
const constant_1 = require("../../constant");
const mongoose_1 = __importDefault(require("mongoose"));
class TenantController {
    createUpdateTenant(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, data } = params;
            const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.TENANT);
            const obj = (0, tenantUtil_1.updateDbName)(data);
            if (data.check === "add") {
                const getEntry = yield dm.findOne({ $or: [{ companyName: obj.companyName }, { dbName: obj.dbName }, { tenantCode: obj.tenantCode }] }).lean();
                if (getEntry && getEntry.companyName === data.companyName) {
                    return { msg: `${data.companyName} is already exist!`, error: true };
                }
                else if (getEntry && getEntry.tenantCode === data.tenantCode) {
                    return { msg: `Tenant code (${data.tenantCode}) is already exist!`, error: true };
                }
                else if (getEntry && getEntry.dbName === data.dbName) {
                    return { msg: `${data.dbName} is already exist!`, error: true };
                }
                else {
                    const doc = new dm(Object.assign(Object.assign({}, obj), { created_at: new Date(), updated_at: new Date() }));
                    doc.save();
                    yield (0, tenantUtil_1.createUpdateClientDb)(obj);
                    yield (0, tenantUtil_1.shareDefaultConnectors)(obj, info);
                    return { msg: `${data.companyName} created successfully!`, error: false };
                }
            }
            else {
                const check2 = yield dm.findOne({ dbName: obj.dbName, tenantCode: obj.tenantCode }).lean();
                yield dm.findOneAndUpdate(check2, Object.assign(Object.assign({}, obj), { updated_at: new Date() }));
                yield (0, tenantUtil_1.createUpdateClientDb)(obj);
                return { msg: `${data.companyName} info updated successfully!`, error: false };
            }
        });
    }
    list(_params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                //    const page = parseInt(params.info.page)
                //     const limit = parseInt(params.info.limit)
                //     const startIndex = (page - 1) * limit;
                //     skip(startIndex).limit(limit).
                let dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(constant_1.OTHER.MASTER_ADMIN_DB, constant_1.COLLECTIONS.TENANT);
                resolve(dm.find().lean());
            });
        });
    }
    deleteTenant(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let response;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(constant_1.OTHER.MASTER_ADMIN_DB, constant_1.COLLECTIONS.TENANT);
                const user = yield dm.findOneAndDelete({ $and: [{ tenantCode: params.tenantCode }, { dbName: params.dbName }] }).lean();
                if (user) {
                    const url = `${process.env.mongo_base_url}/${params.dbName}`;
                    const connection = mongoose_1.default.createConnection(url, { maxPoolSize: 10 });
                    connection.once('open', () => {
                        console.log(`Mongodb called (${params.dbName}) database`);
                        connection.db.dropDatabase();
                    });
                    response = { success: true, status: 200, message: "Tenant delete successfully", error: false };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 400, message: "tenant are not present", error: true };
                    resolve(response);
                    return;
                }
            }));
        });
    }
}
exports.default = new TenantController();
