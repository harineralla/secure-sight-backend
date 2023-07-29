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
const auth_util_1 = require("../utils/auth-util");
const constant_1 = require("../constant");
const dynamicModel_1 = require("../models/dynamicModel");
const email_helper_1 = require("../helper/email.helper");
class AuthController {
    register(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, auth_util_1.sendRegisterInfo)(params);
                resolve(res);
            }));
        });
    }
    login(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, auth_util_1.sendUserDetail)(params);
                resolve(res);
            }));
        });
    }
    licenseKey(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let response;
                    let dbName = process.env.mongo_db || '';
                    const dm = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(dbName, constant_1.COLLECTIONS.LICENSE);
                    const generateRandomString = (len) => {
                        var text = "";
                        var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
                        for (var i = 0; i < len; i++)
                            text += charset.charAt(Math.floor(Math.random() * charset.length));
                        return text;
                    };
                    const licenseKey = generateRandomString(16);
                    const userScheduleData = {
                        email: params.email,
                        licenseKey: licenseKey,
                        expiryDate: params.expiryDate,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    const doc = yield dm(userScheduleData);
                    yield doc.save();
                    if (doc) {
                        let htmlBody = `<h3>Your license key is <b style="color:red;font-size: 20px"> ${licenseKey}</b> and it is expired on <b style="color:red;font-size: 20px"> ${params.expiryDate}</b></h3>`;
                        let subjectData = `Congratulations license key is generated successfully!!!!`;
                        let emailData = { to: params.email, html: htmlBody, subject: subjectData };
                        (0, email_helper_1.sendEmail)(emailData);
                        response = {
                            success: true,
                            status: 200,
                            msg: `License key is generated successfully and send to the email`,
                        };
                        resolve(response);
                        return;
                    }
                    else {
                        response = { success: false, status: 404, msg: `failed to generated license key` };
                        resolve(response);
                        return;
                    }
                }
                catch (e) {
                    let response = {
                        success: false,
                        status: 500,
                        msg: (e === null || e === void 0 ? void 0 : e.message) || 'internal server error',
                    };
                    throw response;
                }
            }));
        });
    }
}
exports.default = new AuthController();
