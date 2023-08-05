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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareDate = void 0;
const CompareDate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const todaysDate = new Date(); //Today Date
    const expiryDate = new Date('2024-12-18');
    if (todaysDate > expiryDate) {
        const response = {
            success: false,
            status: 498,
            msg: "Your subscription has been expired."
        };
        res.send(response);
    }
    else {
        next();
    }
});
exports.CompareDate = CompareDate;
