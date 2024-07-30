"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTHER = exports.AUTH = exports.COLLECTIONS = void 0;
exports.COLLECTIONS = {
    USERS: "users",
    TENANT: "tenant",
    CONNECTOR: "connector",
    DASHBOARD: "dashboard",
    REPORT: "report",
    USERCONNECTOR: "userconnector",
    SCHEDULER: 'scheduler',
    LICENSE: 'license',
    CONNECTOR_CONFIG: 'connectorconfig'
};
exports.AUTH = {
    USER_EXIST: "User Already Exist",
    INVALID_PASSWORD: "Invalid password!",
    WARNING_1: "Invalid Password!",
    WARNING_2: "Email not found!"
};
exports.OTHER = {
    ROLE1: "master_admin",
    ROLE2: "tenant_admin",
    ROLE3: "user",
    MASTER_ADMIN_DB: "secure-sight"
    // MASTER_ADMIN_DB: "orion"
};
