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
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
//public
const esUrl = "http://35.171.144.88:9200/";
const eUrl = "http://35.171.144.88:9200/_cat/indices?v&pretty=true";
//client techm
//const esUrl = "http://10.179.25.132:9200/";
//fifa
//const esUrl = "http://10.130.100.80:9200/";
router.post("/data/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response;
        const test = req.body.test;
        switch (test) {
            case "filtering":
                response = yield axios_1.default.post(`${esUrl}${req.body.index}/_search?size=10000`, {
                    query: {
                        bool: {
                            filter: {
                                terms: {
                                    accountID: req.body.id,
                                }
                            }
                        }
                    }
                });
                break;
            default:
                response = yield axios_1.default.get(`${esUrl}${req.body.index}/_search?size=10000`);
                break;
        }
        res.json(response.data);
    }
    catch (error) {
        res.json(error);
    }
}));
router.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response;
        response = yield axios_1.default.get(`${eUrl}`);
        //   const CSVToJSON = (csv:any)=> {
        //     const lines = csv.split('\n');
        //     const keys = lines[0].split(',');
        //     return lines.slice(1).map((line:any) => {
        //         return line.split(',').reduce((acc:any, cur:any, i:any) => {
        //             const toAdd:any = {};
        //             toAdd[keys[i]] = cur;
        //             return { ...acc, ...toAdd };
        //         }, {});
        //     });
        // };
        res.json(response.data);
    }
    catch (error) {
        res.json(error);
    }
}));
router.post("/cveSearch", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let cve = yield axios_1.default.post(`${esUrl}${req.body.index1}/_search?size=10000`);
        const cveList = cve.data.hits.hits.map((a) => {
            return a['_source'];
        });
        var keys = [];
        let key;
        var results = [];
        for (var i = 0; i < cveList.length; i++) {
            for (key in cveList[i]) {
                if (Array.isArray(cveList[i][key])) {
                    if (cveList[i][key].indexOf(req.body.cve) != -1) {
                        results.push(cveList[i]);
                    }
                }
            }
        }
        (results).map((name) => {
            for (var key in name) {
                keys.push(key);
            }
            return name.keys;
        });
        const rule_id = results;
        let assignedRuleIds = yield axios_1.default.post(`${esUrl}${req.body.index2}/_search?size=10000`, {
            query: {
                bool: {
                    filter: {
                        terms: {
                            assigned_rule_ids: keys,
                        }
                    }
                }
            }
        });
        let unAssignedRuleIds = yield axios_1.default.post(`${esUrl}${req.body.index2}/_search?size=10000`, {
            query: {
                bool: {
                    filter: {
                        terms: {
                            recommended_to_assign_rule_ids: keys,
                        }
                    }
                }
            }
        });
        const ips = assignedRuleIds.data.hits.hits.concat(unAssignedRuleIds.data.hits.hits);
        const ip = ips.map((a) => { return a['_source'].comp_id; });
        let computer = yield axios_1.default.post(`${esUrl}${req.body.index3}/_search?size=10000`, {
            query: {
                bool: {
                    filter: {
                        terms: {
                            id: ip
                        }
                    }
                }
            }
        });
        const computers = computer.data.hits.hits;
        const data = { rule_id, ips, computers };
        res.json(data);
    }
    catch (error) {
        res.json(error);
    }
}));
router.delete("/index", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield axios_1.default.post(`${esUrl}${req.body.index}/_delete_by_query`, {
            query: {
                match: {
                    _index: req.body.index
                }
            }
        });
        res.json(data.data);
    }
    catch (error) {
        res.json(error);
    }
}));
exports.default = router;
// case "sorting":
//   response = await axios.post(`${esUrl}${req.params.index}/_search`, {
//     sort: {
//       createdAt: "desc",
//     },
//   });
//   break;
// case "matching":
//     response = await axios.post(`${esUrl}${req.params.index}/_search?size=500`, {
//         query: {
//             match: {
//                 _accountID: req.query.id,
//             },
//         },
//     });
//     break;
// case "multi-matching":
//   response = await axios.post(`${esUrl}${req.body.index}/_search`, {
//     query: {
//       bool: {
//         must: [
//           {
//             match: {
//               name: "Anastacio Stamm",
//             },
//           },
//           {
//             match: {
//               country: "Samoa",
//             },
//           },
//         ],
//       },
//     },
//   });
//   break;
router.post("/create-index", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkIndexExist = () => new Promise((resolve) => {
            axios_1.default
                .get(`${esUrl}${req.body.index}`)
                .then((_) => {
                resolve(true);
            })
                .catch(() => {
                resolve(false);
            });
        });
        const ifIndexExist = yield checkIndexExist();
        if (!ifIndexExist) {
            const esResponse = yield axios_1.default.put(`${esUrl}${req.body.index}`, {
                mappings: {
                    properties: {
                        name: {
                            type: "text",
                        },
                        email: {
                            type: "text",
                            fields: {
                                raw: {
                                    type: "keyword",
                                },
                            },
                        },
                        country: {
                            type: "text",
                        },
                        age: {
                            type: "integer",
                        },
                        company: {
                            type: "text",
                        },
                        jobRole: {
                            type: "text",
                        },
                        description: {
                            type: "text",
                        },
                        createdAt: {
                            type: "date",
                            fields: {
                                raw: {
                                    type: "keyword",
                                },
                            },
                        },
                    },
                },
            });
            res.json(esResponse.data);
        }
        else {
            res.json("Index exist already");
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
}));
