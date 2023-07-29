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
const dashboardController_1 = __importDefault(require("../controllers/dashboardController"));
router.post('/create-dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.createDashboard(req.body);
    res.send(data);
}));
router.post('/update-dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.updateDashboard(req.body);
    res.send(data);
}));
router.post('/get-dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.getDashboard(req.body);
    res.send(data);
}));
router.post('/delete-dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.deleteDashboard(req.body);
    res.send(data);
}));
router.post('/add-dashborad-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.addDashboardData(req.body);
    res.send(data);
}));
router.post('/update-table-title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.updateTableTitle(req.body);
    res.send(data);
}));
router.post('/get-dashborad-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.getDashboardData(req.body);
    res.send(data);
}));
router.post('/get-dashborad-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.getDashboardData(req.body);
    res.send(data);
}));
router.post('/delete-dashborad-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield dashboardController_1.default.deleteDashboardData(req.body);
    res.send(data);
}));
exports.default = router;
