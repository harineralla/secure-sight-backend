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
const esUrl = "http://localhost:9200/";
const axios_1 = __importDefault(require("axios"));
class elasticController {
    getData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let response;
                    const test = params.test;
                    switch (test) {
                        case "sorting":
                            response = yield axios_1.default.post(`${esUrl}${params.index}/_search`, {
                                sort: {
                                    createdAt: "desc",
                                },
                            });
                            break;
                        case "matching":
                            response = yield axios_1.default.post(`${esUrl}${params.index}/_search`, {
                                query: {
                                    match: {
                                        country: "samoa",
                                    },
                                },
                            });
                            break;
                        case "multi-matching":
                            response = yield axios_1.default.post(`${esUrl}${params.index}/_search`, {
                                query: {
                                    bool: {
                                        must: [
                                            {
                                                match: {
                                                    name: "Anastacio Stamm",
                                                },
                                            },
                                            {
                                                match: {
                                                    country: "Samoa",
                                                },
                                            },
                                        ],
                                    },
                                },
                            });
                            break;
                        default:
                            response = yield axios_1.default.get(`${esUrl}${params.index}/_search`);
                            break;
                    }
                }
                catch (error) {
                }
            }));
        });
    }
}
exports.default = new elasticController();
