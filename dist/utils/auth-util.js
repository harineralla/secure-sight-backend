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
exports.sendRegisterInfo = exports.sendUserDetail = exports.setDbName = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dynamicModel_1 = require("../models/dynamicModel");
const index_1 = require("../constant/index");
const setDbName = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if ([index_1.OTHER.ROLE2, index_1.OTHER.ROLE3].includes(req.body.role)) {
        const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(index_1.OTHER.MASTER_ADMIN_DB, index_1.COLLECTIONS.TENANT);
        const user = yield dm.findOne({ tenantCode: req.body.tenantCode }).lean();
        req.body.dbName = user.dbName;
        req.body.companyName = user.companyName;
    }
    else {
        req.body.dbName = index_1.OTHER.MASTER_ADMIN_DB;
    }
    next();
});
exports.setDbName = setDbName;
function matchCredential(params, user) {
    let response;
    let jwtSecret = process.env.jwtSecret;
    let jwtSignInExpiresIn = process.env.jwtSignInExpiresIn;
    return new Promise(resolve => {
        bcryptjs_1.default.compare(params.password, user.password).then(isMatch => {
            isMatch = true;
            if (isMatch) {
                jsonwebtoken_1.default.sign(params, jwtSecret, { expiresIn: jwtSignInExpiresIn }, (err, token) => {
                    delete params.password;
                    params.fullname = user.full_name,
                        params.id = user._id;
                    let name = (params.role === "tenant_admin") ? `${user.companyName}` : `${user.full_name}`;
                    response = {
                        success: true,
                        status: 200,
                        data: Object.assign({ token }, params),
                        msg: name + ` successfully login`
                    };
                    resolve(response);
                    return;
                });
            }
            else {
                response = {
                    success: false,
                    status: 422,
                    msg: index_1.AUTH.WARNING_1
                };
                resolve(response);
                return;
            }
        });
    });
}
const sendUserDetail = (params) => __awaiter(void 0, void 0, void 0, function* () {
    let response;
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        const dm = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(params.dbName, index_1.COLLECTIONS.USERS);
        let user = yield dm.findOne({ email: params.email }).lean();
        if (user) {
            resolve(yield matchCredential(params, user));
        }
        else {
            response = {
                success: false,
                status: 422,
                msg: index_1.AUTH.WARNING_2
            };
            resolve(response);
            return;
        }
    }));
});
exports.sendUserDetail = sendUserDetail;
const sendRegisterInfo = (params) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(index_1.OTHER.MASTER_ADMIN_DB, index_1.COLLECTIONS.USERS);
        let user = yield dm.findOne({ email: params.email });
        if (user) {
            resolve({ msg: index_1.AUTH.USER_EXIST });
        }
        else {
            bcryptjs_1.default.genSalt(10, (_err, salt) => __awaiter(void 0, void 0, void 0, function* () {
                bcryptjs_1.default.hash(params.password, salt, (err2, hash) => __awaiter(void 0, void 0, void 0, function* () {
                    if (err2) {
                        resolve({ err2 });
                    }
                    else {
                        params.password = hash;
                        const doc = new dm(params);
                        yield doc.save({ password: 0 });
                        const response = yield dm.findOne({ email: params.email }, { password: 0 });
                        resolve(response);
                    }
                }));
            }));
        }
    }));
});
exports.sendRegisterInfo = sendRegisterInfo;
