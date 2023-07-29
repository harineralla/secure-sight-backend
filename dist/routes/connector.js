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
const connectorController_1 = __importDefault(require("../controllers/connectorController"));
const fileUpload_helper_1 = require("../helper/fileUpload.helper");
router.post('/add-update-connector', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.createUpdateConnector(req.body);
    res.send(data);
}));
router.post('/insert-multi-connector', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.insertMultiConnector(req.body);
    res.send(data);
}));
router.post('/connector-list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.connectorList(req.body);
    res.send(data);
}));
router.post('/activate-connector', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.activateConnector(req.body);
    res.send(data);
}));
router.post('/share-connector', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.shareConnector(req.body);
    res.send(data);
}));
router.post('/delete-connectorByMaster', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.masterDeleteConnector(req.body);
    res.send(data);
}));
router.post('/delete-connectorByTenant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.tenantDeleteConnector(req.body);
    res.send(data);
}));
router.post('/shareConnectorToUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.asignConnector(req.body);
    res.send(data);
}));
router.post('/connectorListForUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.connectorListForUser(req.body);
    res.send(data);
}));
router.post('/schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.connectorScheduleTest(req.body);
    res.send(data);
}));
router.post('/add-connector-config', fileUpload_helper_1.upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield connectorController_1.default.connectorSchedulingDataInsert(req.body);
    res.send(data);
}));
exports.default = router;
