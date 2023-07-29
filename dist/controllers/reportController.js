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
const dynamicModel_1 = require("../models/dynamicModel");
const constant_1 = require("../constant");
const reports_helper_1 = require("../helper/reports.helper");
const json2csv_1 = require("json2csv");
const mongoose_1 = __importDefault(require("mongoose"));
class reportController {
    createReport(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const { info, data } = params;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.REPORT);
                const getEntry = yield dm.findOne({ $or: [{ reportName: data.reportName }, { dbName: info.dbName }, { tenantCode: info.tenantCode }] }).lean();
                if (getEntry && getEntry.reportName === data.reportName) {
                    response = { success: false, status: 409, msg: `${data.reportName} report is already exits` };
                    resolve(response);
                    return;
                }
                else {
                    const doc = new dm(Object.assign(Object.assign({}, data), { type: "report", created_at: new Date(), updated_at: new Date() }));
                    yield doc.save();
                    response = { success: true, status: 200, msg: `${data.reportName} report created successfully.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    getReport(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(params.dbName, constant_1.COLLECTIONS.REPORT);
                const report = yield dm.find({ $and: [{ user_id: params.user_id }, { type: 'report' }] }).lean();
                if (report.length > 0) {
                    response = { success: true, status: 200, data: report, msg: `User reports.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `User reports not found.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    deleteReport(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.REPORT);
                const report = yield dm.find({ $and: [{ _id: info.id }, { user_id: info.user_id }] }).lean();
                if (report.length > 0) {
                    yield dm.deleteOne({ "_id": info.id });
                    response = { success: true, status: 200, msg: `User report delete successfully.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `User report not found.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    addReportData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const { info, data } = params;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.REPORT);
                const getEntry = yield dm.findOne({ _id: info.report_id }).lean();
                const query = { report_id: info.report_id, user_id: info.user_id, type: "table", title: info.title, data: data.data };
                if (getEntry) {
                    const doc = new dm(Object.assign(Object.assign({}, query), { created_at: new Date() }));
                    yield doc.save();
                    response = { success: true, status: 200, msg: `${info.title} table created successfully`, error: false };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 400, msg: `${info.title} table failed to created`, error: true };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    getReportData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const { info, data } = params;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.REPORT);
                const getEntry = yield dm.find({ $and: [{ report_id: data.report_id }, { user_id: data.user_id }] }).lean();
                if (getEntry) {
                    response = { success: true, status: 200, data: getEntry, msg: `Get report data successfully.`, error: false };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `report data not found`, error: true };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    deleteReportData(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.REPORT);
                const report = yield dm.findOneAndDelete({ $and: [{ _id: info.id }, { user_id: info.user_id }, { report_id: info.report_id }] }).lean();
                if (report) {
                    response = { success: true, status: 200, msg: `report data delete succeassfully.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 400, msg: `Failed to delete.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    updateReport(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, data } = params;
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.REPORT);
                const report = yield dm.findOneAndUpdate({ _id: info.report_id, user_id: info.user_id }, { $set: { reportName: data.reportName } });
                if (report) {
                    response = { success: true, status: 200, msg: `User report name updated successfully.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `User report not found.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    updateReportTableTitle(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, data } = params;
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.REPORT);
                const report = yield dm.findOneAndUpdate({ _id: info.table_id, report_id: info.report_id, user_id: info.user_id }, { $set: { title: data.title } });
                if (report) {
                    response = { success: true, status: 200, msg: `User table name updated successfully.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `User table not found.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    crossTableReport(params, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, data } = params;
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let user_id = info.user_id;
                let reportData = data;
                if (!user_id) {
                    response = {
                        success: false,
                        status: 400,
                        msg: `user_id is not provided.`,
                    };
                    resolve(res.status(400).json(response));
                    return;
                }
                let finalDataToBeConvert = [];
                let flattenData = [];
                if (reportData.length == 0 ||
                    reportData == undefined ||
                    reportData == null) {
                    response = {
                        success: false,
                        status: 404,
                        msg: `reports data is not provided.`,
                    };
                    res.status(404).json(response);
                    resolve(res);
                    return;
                }
                try {
                    for (let i = 0; i < reportData.length; i++) {
                        let { id, dbName } = reportData[i];
                        id = new mongoose_1.default.Types.ObjectId(id);
                        const dmReport = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(dbName, constant_1.COLLECTIONS.REPORT);
                        let repData = yield dmReport.findOne({ _id: id, user_id }).lean();
                        if (repData.type === 'table') {
                            const reports = yield dmReport
                                .find({
                                _id: String(id),
                                user_id,
                            })
                                .lean();
                            if (reports.length > 0) {
                                reports.forEach((dRep) => {
                                    const data = dRep.data;
                                    if (data.length > 0) {
                                        finalDataToBeConvert = [...finalDataToBeConvert, ...data];
                                    }
                                });
                            }
                        }
                        else {
                            const data = repData.data;
                            if (data.length > 0) {
                                finalDataToBeConvert = [...finalDataToBeConvert, ...data];
                            }
                        }
                    }
                    for (let i = 0; i < finalDataToBeConvert.length; i++) {
                        let flatData = yield (0, reports_helper_1.jsonFlattenObject)(finalDataToBeConvert[i]);
                        flattenData.push(flatData);
                    }
                    const json2csvParser = new json2csv_1.Parser();
                    if (flattenData.length > 0) {
                        // const csvFromArrayOfObjects = json2csvParser.parse(flattenData)
                        // const report_data = new Date()
                        // res.setHeader('Content-Type', 'json/csv')
                        // let fileName = `combined_report_${Number(report_data)}.csv`
                        // res.attachment(fileName)
                        res.status(200).send(flattenData);
                        resolve(res);
                        return;
                    }
                }
                catch (err) {
                    response = {
                        success: false,
                        status: 500,
                        msg: String(err.message),
                    };
                    res.status(500).json(response);
                    resolve(res);
                    return;
                }
            }));
        });
    }
}
exports.default = new reportController();
