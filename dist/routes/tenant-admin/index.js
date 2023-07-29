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
const userController_1 = __importDefault(require("../../controllers/tenant-admin-controller/userController"));
router.post('/add-update-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield userController_1.default.addUpdateUser(req.body);
    res.send(data);
}));
router.post('/user-list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield userController_1.default.userList(req.body);
    res.send(data);
}));
router.post('/delete-user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield userController_1.default.deleteUser(req.body);
    res.send(data);
}));
exports.default = router;
