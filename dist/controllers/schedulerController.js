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
const mongoose_1 = __importDefault(require("mongoose"));
const dynamicModel_1 = require("../models/dynamicModel");
const constant_1 = require("../constant");
const mainDb = process.env.mongo_db || '';
class schedulerController {
    scheduleMail(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let response;
                    const { emailData, schedulingTime, userId, reportIds, dbName } = params;
                    const dm = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(mainDb, constant_1.COLLECTIONS.SCHEDULER);
                    let uid = new mongoose_1.default.Types.ObjectId(userId);
                    let reportObjectIds = reportIds.map((id) => new mongoose_1.default.Types.ObjectId(id));
                    const userScheduleData = {
                        userId: uid,
                        reportIds: reportObjectIds,
                        isScheduleActive: true,
                        mailData: emailData,
                        schedule: schedulingTime,
                        dbName: dbName,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    const doc = yield dm(userScheduleData);
                    yield doc.save();
                    if (doc) {
                        response = {
                            success: true,
                            status: 200,
                            msg: `email scheduled successfully`,
                        };
                        resolve(response);
                        return;
                    }
                    else {
                        response = { success: false, status: 404, msg: `email not scheduled` };
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
                    resolve(response);
                    return;
                }
            })).catch((e) => {
                let response = {
                    success: false,
                    status: 500,
                    msg: (e === null || e === void 0 ? void 0 : e.message) || 'internal server error',
                };
                return Promise.reject(response);
            });
        });
    }
}
exports.default = new schedulerController();
