"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const UserSchema = new Schema({
    companyName: String,
    tenantCode: String,
    industry: String,
    hqLocation: String,
    dbName: String,
    fullName: String,
    email: String,
    password: String,
    role: String
});
exports.default = UserSchema;
