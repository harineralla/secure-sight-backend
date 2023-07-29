"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
let dir = './upload/';
if (!(0, fs_1.existsSync)(dir)) {
    (0, fs_1.mkdirSync)(dir, { recursive: true });
}
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './upload/');
        },
        filename: function (req, file, cb) {
            let filename = path_1.default.parse(file.originalname).name;
            let time = new Date().getTime();
            let extension = path_1.default.extname(file.originalname);
            cb(null, filename + '-' + time + extension);
        },
    }),
});
