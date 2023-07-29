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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const reportController_1 = __importDefault(require("../controllers/reportController"));
router.post('/create-report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.createReport(req.body);
    res.send(data);
}));
router.post('/get-report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.getReport(req.body);
    res.send(data);
}));
router.post('/update-report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.updateReport(req.body);
    res.send(data);
}));
router.post('/delete-report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.deleteReport(req.body);
    res.send(data);
}));
router.post('/add-report-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.addReportData(req.body);
    res.send(data);
}));
router.post('/update-reportTable-title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.updateReportTableTitle(req.body);
    res.send(data);
}));
router.post('/get-report-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.getReportData(req.body);
    res.send(data);
}));
router.post('/get-report-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.getReportData(req.body);
    res.send(data);
}));
router.post('/delete-report-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield reportController_1.default.deleteReportData(req.body);
    res.send(data);
}));
router.post('/merge-report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield reportController_1.default.crossTableReport(req.body, res);
}));
exports.default = router;
