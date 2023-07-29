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
const dynamicModel_1 = require("../models/dynamicModel");
const constant_1 = require("../constant");
class dashboardController {
    createDashboard(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const { info, data } = params;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.DASHBOARD);
                const getEntry = yield dm.findOne({ $or: [{ dashboardName: data.dashboardName }, { dbName: info.dbName }, { tenantCode: info.tenantCode }] }).lean();
                if (getEntry && getEntry.dashboardName === data.dashboardName) {
                    response = { success: false, status: 409, msg: `${data.dashboardName} dashboard is already exits` };
                    resolve(response);
                    return;
                }
                else {
                    const doc = new dm(Object.assign(Object.assign({}, data), { type: "dashboard", created_at: new Date(), updated_at: new Date() }));
                    yield doc.save();
                    response = { success: true, status: 200, msg: `${data.dashboardName} dashboard created successfully.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    getDashboard(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(params.dbName, constant_1.COLLECTIONS.DASHBOARD);
                const dashboard = yield dm.find({ $and: [{ user_id: params.user_id }, { type: 'dashboard' }] }).lean();
                if (dashboard.length > 0) {
                    response = { success: true, status: 200, data: dashboard, msg: `User Dashboard.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `User dashboard not found.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    deleteDashboard(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.DASHBOARD);
                const dashboard = yield dm.find({ $and: [{ _id: info.id }, { user_id: info.user_id }] }).lean();
                if (dashboard.length > 0) {
                    yield dm.deleteOne({ "_id": info.id });
                    response = { success: true, status: 200, msg: `User dashboard delete succeassfully.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `User dashboard not found.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    addDashboardData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const { info, data } = params;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.DASHBOARD);
                const getEntry = yield dm.findOne({ _id: info.dashboard_id }).lean();
                const query = { dashboard_id: info.dashboard_id, user_id: info.user_id, type: info.type, title: info.title, column: info.column, data: data.data };
                if (getEntry) {
                    const doc = new dm(Object.assign(Object.assign({}, query), { created_at: new Date() }));
                    yield doc.save();
                    response = { success: true, status: 200, msg: `${info.type} created successfully`, error: false };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 400, msg: `(${info.type}) failed to created`, error: true };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    getDashboardData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const { info, data } = params;
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.DASHBOARD);
                const getEntry = yield dm.find({ $and: [{ dashboard_id: data.dashboard_id }, { user_id: data.user_id }] }).lean();
                if (getEntry) {
                    response = { success: true, status: 200, data: getEntry, msg: `Get dashboard data successfully.`, error: false };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `Dashboard data not found`, error: true };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    deleteDashboardData(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.DASHBOARD);
                const dashboard = yield dm.findOneAndDelete({ $and: [{ _id: info.id }, { user_id: info.user_id }, { dashboard_id: info.dashboard_id }] }).lean();
                if (dashboard) {
                    response = { success: true, status: 200, msg: `Dashboard data delete succeassfully.` };
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
    updateDashboard(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, data } = params;
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.DASHBOARD);
                const dashboard = yield dm.findOneAndUpdate({ _id: info.dashboard_id, user_id: info.user_id }, { $set: { dashboardName: data.dashboardName } });
                if (dashboard) {
                    response = { success: true, status: 200, msg: `User dashboard name updated successfully.` };
                    resolve(response);
                    return;
                }
                else {
                    response = { success: false, status: 404, msg: `User dashboard not found.` };
                    resolve(response);
                    return;
                }
            }));
        });
    }
    updateTableTitle(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, data } = params;
            let response;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const dm = (0, dynamicModel_1.dynamicModelWithDBConnection)(info.dbName, constant_1.COLLECTIONS.DASHBOARD);
                const dashboard = yield dm.findOneAndUpdate({ _id: info.table_id, dashboard_id: info.dashboard_id, user_id: info.user_id }, { $set: { title: data.title } });
                if (dashboard) {
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
}
exports.default = new dashboardController();
