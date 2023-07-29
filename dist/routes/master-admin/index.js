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
const tenantController_1 = __importDefault(require("../../controllers/master-admin-controller/tenantController"));
router.post('/add-update-tenant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield tenantController_1.default.createUpdateTenant(req.body);
    res.send(data);
}));
router.post('/delete-tenant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield tenantController_1.default.deleteTenant(req.body);
    res.send(data);
}));
router.post('/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield tenantController_1.default.list(req.body);
    res.send(data);
}));
// router.post('/add-update-connector', async (req: Request<ConnectorProps>, res: Response) => {
//     let data = await ConnectorController.createUpdateConnector(req.body)
//     res.send(data)
// })
exports.default = router;
