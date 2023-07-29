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
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
const authController_1 = __importDefault(require("../controllers/authController"));
const auth_util_1 = require("../utils/auth-util");
const auth_1 = require("../middleware/auth");
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield authController_1.default.register(req.body);
    res.send(data);
}));
router.post('/login', auth_1.CompareDate, auth_util_1.setDbName, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield authController_1.default.login(req.body);
    res.send(data);
}));
router.post('/info', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(req.user);
}));
router.post('/generate-license-key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield authController_1.default.licenseKey(req.body);
    res.send(data);
}));
exports.default = router;
