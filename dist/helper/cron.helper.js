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
exports.stopTestConnectorScheduler = exports.connectorTestScheduler = void 0;
const node_cron_1 = require("node-cron");
const fs_1 = __importDefault(require("fs"));
const email_helper_1 = require("./email.helper");
const dynamicModel_1 = require("../models/dynamicModel");
const constant_1 = require("../constant");
const json2csv_1 = require("json2csv");
const child_process_1 = __importDefault(require("child_process"));
const mongoose_1 = __importDefault(require("mongoose"));
const reports_helper_1 = require("./reports.helper");
const path = require('path');
const decompress_1 = __importDefault(require("decompress"));
let scheduledControllerDB = {};
const mainDb = process.env.mongo_db || '';
class cronScheduler {
    constructor() {
        this.convertNumberIntoCronExpressionByDate = (typeOfCron) => {
            if (typeOfCron !== 0 && typeOfCron !== null && typeOfCron !== undefined) {
                return typeOfCron;
            }
            else {
                return '*';
            }
        };
        this.timeToCronStarConvert = (typeOfCron) => {
            if (typeOfCron !== 0 && typeOfCron !== null && typeOfCron !== undefined) {
                return '*/' + typeOfCron;
            }
            else {
                return '*';
            }
        };
        this.dateTimeToCronTime = (minutes, hours, days, months, dayOfWeek) => {
            let m = this.convertNumberIntoCronExpressionByDate(minutes);
            let h = this.convertNumberIntoCronExpressionByDate(hours);
            let d = this.convertNumberIntoCronExpressionByDate(days);
            let month = this.convertNumberIntoCronExpressionByDate(months);
            let weekDay = this.convertNumberIntoCronExpressionByDate(dayOfWeek);
            if (days > 0 && hours === 0) {
                h = '0';
                if (minutes === 0) {
                    m = '0';
                }
            }
            if (hours > 0 && minutes === 0) {
                m = '0';
            }
            return `${m + ' ' + h + ' ' + d + ' ' + month + ' ' + weekDay}`;
        };
        this.timeToCron = (minutes, hours, days, months, dayOfWeek) => {
            let m = this.timeToCronStarConvert(minutes);
            let h = this.timeToCronStarConvert(hours);
            let d = this.timeToCronStarConvert(days);
            let month = this.timeToCronStarConvert(months);
            let weekDay = this.timeToCronStarConvert(dayOfWeek);
            return `${m + ' ' + h + ' ' + d + ' ' + month + ' ' + weekDay}`;
        };
        this.schedule = (0, node_cron_1.schedule)('* * * * *', () => __awaiter(this, void 0, void 0, function* () {
            const dmScheduler = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(mainDb, constant_1.COLLECTIONS.SCHEDULER);
            const schedulers = yield dmScheduler.find().lean();
            schedulers.forEach((sc) => {
                if (sc.isScheduleActive === true) {
                    const mailData = {
                        id: sc._id,
                        emailData: sc.mailData,
                        schedulingTime: sc.schedule,
                        reportIds: sc.reportIds,
                        dbName: sc.dbName,
                    };
                    this.sendMailFn(mailData);
                }
            });
        }), { scheduled: false });
    }
    sendMailFn({ id, emailData, schedulingTime, reportIds, dbName, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const minutes = schedulingTime.minutes || 0;
            const hours = schedulingTime.hours || 0;
            const days = schedulingTime.days || 0;
            const months = schedulingTime.months || 0;
            const dayOfWeek = schedulingTime.dayOfWeek || 0;
            const dmReport = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(dbName, constant_1.COLLECTIONS.REPORT);
            const dmScheduler = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(mainDb, constant_1.COLLECTIONS.SCHEDULER);
            let cronExpression;
            if (schedulingTime.isSpecificDateAndTime === true) {
                cronExpression = this.dateTimeToCronTime(minutes, hours, days, months, dayOfWeek);
            }
            else {
                cronExpression = this.timeToCron(minutes, hours, days, months, dayOfWeek);
            }
            const json2csvParser = new json2csv_1.Parser();
            const abc = (0, node_cron_1.schedule)(cronExpression, () => __awaiter(this, void 0, void 0, function* () {
                reportIds = [...new Set(reportIds)];
                for (const reportId of reportIds) {
                    let attachments = [];
                    let report = yield dmReport.findOne({ _id: reportId }).lean();
                    if (!report) {
                        yield dmScheduler.findOneAndUpdate({ _id: id }, {
                            $set: {
                                isScheduleActive: false,
                            },
                        });
                    }
                    if (report.type === 'report') {
                        const reports = yield dmReport.find({ report_id: String(reportId) }).lean();
                        if (reports.length > 0) {
                            reports.forEach((dRep) => {
                                const data = dRep.data;
                                if (data.length > 0) {
                                    const flattenData = (0, reports_helper_1.jsonFlattenObject)(data);
                                    const csvFromArrayOfObjects = json2csvParser.parse(flattenData);
                                    let attachment = {
                                        filename: `${String(dRep.title)}.csv`,
                                        content: csvFromArrayOfObjects,
                                    };
                                    attachments.push(attachment);
                                }
                            });
                        }
                        else {
                            if (!report) {
                                let updateReport = yield dmScheduler.findOneAndUpdate({ _id: id }, {
                                    $set: {
                                        isScheduleActive: false,
                                    },
                                });
                            }
                        }
                    }
                    else {
                        const data = report.data;
                        if (data.length > 0) {
                            const csvFromArrayOfObjects = json2csvParser.parse(data);
                            attachments.push({
                                filename: `${String(report._id)}.csv`,
                                content: csvFromArrayOfObjects,
                            });
                        }
                    }
                    if (attachments.length > 0) {
                        const finalMailData = Object.assign(Object.assign({}, emailData), { attachments: attachments });
                        yield (0, email_helper_1.sendEmail)(finalMailData);
                    }
                }
            }), { scheduled: true });
            abc.start();
        });
    }
}
const connectorTestScheduler = (response, data) => __awaiter(void 0, void 0, void 0, function* () {
    const presentWorkingDir = process.env.PWD;
    const serverPath = path.resolve(presentWorkingDir, `../orion-scheduler/server`);
    console.log('connector scheduler start!!');
    try {
        let { minute, hour, date, day, repeat, connectorId, userId, dbName } = response;
        const dbConnection = yield (0, dynamicModel_1.dynamicModelWithDBConnection)(dbName, constant_1.COLLECTIONS.CONNECTOR_CONFIG);
        const config_data = yield dbConnection
            .findOne({ connectorId: new mongoose_1.default.Types.ObjectId(connectorId) })
            .lean();
        let { connectorBasePath, config, connectorFileNameWithExtension } = config_data;
        let argsList = [];
        Object.keys(config).forEach((keyOfSecretData) => {
            const { type, position, isPathArg } = config[keyOfSecretData];
            argsList[position] = isPathArg
                ? `${serverPath}/${connectorBasePath}/${data[keyOfSecretData]}`
                : data[keyOfSecretData];
        });
        let schedulingString = '';
        if (repeat.toLowerCase() == 'hourly') {
            schedulingString = `0 * * * *`;
        }
        else if (repeat.toLowerCase() == 'daily') {
            schedulingString = `${minute} ${hour} * * *`;
        }
        else if (repeat.toLowerCase() == 'weekly') {
            schedulingString = `${minute} ${hour} * * ${day}`;
        }
        else if (repeat.toLowerCase() == 'monthly') {
            schedulingString = `${minute} ${hour} ${date} * *`;
        }
        else if (repeat.toLowerCase() == 'minute') {
            schedulingString = `*/${minute} * * * *`;
        }
        else {
            schedulingString = `0 */23 * * *`;
        }
        let argsOfConnector = argsList.join(' ').trim();
        let command = `python3 ${serverPath}/${connectorBasePath}/${connectorFileNameWithExtension} ${argsOfConnector} > ${serverPath}/cron.log 2>&1`;
        let zipFilePath = path.join(serverPath, connectorBasePath + `.zip`);
        const isFileExists = yield fs_1.default.access(`${serverPath}/${connectorBasePath}/${connectorFileNameWithExtension}`, fs_1.default.constants.F_OK, (err) => {
            console.log('Err', err);
            console.log('Connector not exists trying to uncompress....');
            (0, decompress_1.default)(zipFilePath, serverPath)
                .then((files) => {
                console.log(`unzipped the ${connectorBasePath}`);
                const job = (0, node_cron_1.schedule)(schedulingString, () => {
                    child_process_1.default.exec(command, {}, (err, stdout, stderr) => { });
                    console.log('***Connector scheduled!***');
                }, { scheduled: true });
                scheduledControllerDB[connectorId] = job;
                job.start();
                return true;
            })
                .catch((err) => {
                console.log('Unzip not done::', err.message);
                return false;
            });
            return !err;
        });
    }
    catch (e) {
        console.log('Error ::', e.message);
    }
});
exports.connectorTestScheduler = connectorTestScheduler;
const stopTestConnectorScheduler = (connectorId) => __awaiter(void 0, void 0, void 0, function* () {
    let job = scheduledControllerDB[connectorId];
    if (job) {
        job.stop();
        return true;
    }
    return false;
});
exports.stopTestConnectorScheduler = stopTestConnectorScheduler;
exports.default = cronScheduler;
