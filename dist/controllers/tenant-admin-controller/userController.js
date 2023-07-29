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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dynamicModel_1 = require("../../models/dynamicModel");
// import { createUpdateClientDb, updateDbName } from '../../utils/tenantUtil'
const constant_1 = require("../../constant");
class UserController {
    generatePassword(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                bcryptjs_1.default.genSalt(10, (_err, salt) => __awaiter(this, void 0, void 0, function* () {
                    bcryptjs_1.default.hash(query.password, salt, (err2, hash) => __awaiter(this, void 0, void 0, function* () {
                        if (err2) {
                            resolve("");
                        }
                        else {
                            resolve(hash);
                        }
                    }));
                }));
            });
        });
    }
    addUpdateUser(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let query = Object.assign(Object.assign({}, params.query), { tenantCode: params.info.tenantCode, dbName: params.info.dbName }), info = params.info;
                let dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.USERS);
                const password = yield this.generatePassword(query);
                query = Object.assign(Object.assign({}, query), { password, role: constant_1.OTHER.ROLE3, updated_at: new Date() });
                if (query.check === "add") {
                    const user = yield dm.findOne({ email: query.email });
                    if (!user) {
                        const doc = new dm(Object.assign(Object.assign({}, query), { created_at: new Date() }));
                        yield doc.save();
                        resolve({ msg: `${query.email} created successfully`, error: false });
                    }
                    else {
                        resolve({ msg: `${query.email} already exist!`, error: true });
                    }
                }
                else {
                    yield dm.findOneAndUpdate({ email: query.email }, { $set: query });
                    resolve({ msg: `Updated successfully!`, error: false });
                }
                resolve(params);
            }));
        });
    }
    userList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                // const page = parseInt(params.info.page)
                // const limit = parseInt(params.info.limit)
                // const startIndex = (page - 1) * limit;
                // .skip(startIndex).limit(limit)
                let dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(params.info.dbName, constant_1.COLLECTIONS.USERS);
                resolve(dm.find({ role: "user" }).lean());
            });
        });
    }
    deleteUser(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                let dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(params.dbName, constant_1.COLLECTIONS.USERS);
                let user = dm.findOne({ tenantCode: params.tenantCode, email: params.email }).lean();
                if (user) {
                    resolve(user.deleteOne({ role: "user" }));
                }
                else {
                    resolve({ msg: "User not present" });
                }
            });
        });
    }
}
exports.default = new UserController();
