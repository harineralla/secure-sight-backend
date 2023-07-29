"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const ObjectId = mongoose_1.default.Types.ObjectId;
const mailSchema = new Schema({
    to: String,
    subject: String,
    text: String,
    // attachments?: Array<{
    //  filename?: string
    //  content?: string
    //  contentType?: string
    //  path?: string
    // }>
});
const schedulingSchema = new Schema({
    minutes: Number,
    hours: Number,
    days: Number,
    months: Number,
    dayOfWeek: Number,
    isSpecificDateAndTime: Boolean,
});
const schedulerSchema = new Schema({
    userId: ObjectId,
    reportIds: [ObjectId],
    isScheduleActive: Boolean,
    mailData: mailSchema,
    schedule: schedulingSchema,
});
module.exports = mongoose_1.default.model('Scheduler', schedulerSchema);
