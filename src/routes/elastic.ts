import express, { Request, Response } from 'express'
import axios from 'axios';
const router = express.Router();
//public
const esUrl = "http://35.222.53.119:9200/";
const eUrl = "http://35.222.53.119:9200/_cat/indices?v&pretty=true";
//client techm
//const esUrl = "http://10.179.25.132:9200/";
//fifa
//const esUrl = "http://10.130.100.80:9200/";

router.post("/data/", async (req, res) => {
  try {
    let response;
    const test = req.body.test;
    switch (test) {
      case "filtering":
        response = await axios.post(`${esUrl}${req.body.index}/_search?size=10000`, {
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
        response = await axios.get(`${esUrl}${req.body.index}/_search?size=10000`);
        break;
    }
    res.json(response.data);

  } catch (error) {
    res.json(error);
  }

});

router.get("/list", async (req, res) => {
  try {
    let response;
    response = await axios.get(`${eUrl}`);
    const CSVToJSON = (csv:any)=> {
      const lines = csv.split('\n');
      const keys = lines[0].split(',');
      return lines.slice(1).map((line:any) => {
          return line.split(',').reduce((acc:any, cur:any, i:any) => {
              const toAdd:any = {};
              toAdd[keys[i]] = cur;
              return { ...acc, ...toAdd };
          }, {});
      });
  };

    res.json(response.data);
  } catch (error) {
    res.json(error);
  }
});

router.post("/dataSource", async (req, res) => {
  try {
    let response;
    response = await axios.get(`${eUrl}`);

  console.log(response.data)
  const indicesData = response.data;
  const indicesList: string[] = indicesData.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.split(/\s+/)[2]);
  res.json(indicesList);
  } catch (error) {
    res.json(error);
  }
});

router.post("/cveSearch", async (req, res) => {
  try {
    let cve = await axios.post(`${esUrl}${req.body.index1}/_search?size=10000`);
    const cveList = cve.data.hits.hits.map((a: any) => {
      return a['_source']
    })
    var keys: any = [];
    let key
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
      return name.keys
    });
    const rule_id = results
    let assignedRuleIds = await axios.post(`${esUrl}${req.body.index2}/_search?size=10000`, {
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
    let unAssignedRuleIds = await axios.post(`${esUrl}${req.body.index2}/_search?size=10000`, {
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
    const ips = assignedRuleIds.data.hits.hits.concat(unAssignedRuleIds.data.hits.hits)
    const ip = ips.map((a: any) => { return a['_source'].comp_id })
    let computer = await axios.post(`${esUrl}${req.body.index3}/_search?size=10000`, {
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
    const computers = computer.data.hits.hits
    const data = { rule_id, ips, computers }
    res.json(data);
  } catch (error) {
    res.json(error);
  }
});

router.delete("/index", async (req, res) => {
  try {
    let data = await axios.post(`${esUrl}${req.body.index}/_delete_by_query`, {
      query: {
        match: {
          _index: req.body.index
        }
      }
    });
    res.json(data.data);

  } catch (error) {
    res.json(error);
  }
});


export default router;


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



router.post("/create-index", async (req, res) => {
  try {
    const checkIndexExist = () =>
      new Promise((resolve) => {
        axios
          .get(`${esUrl}${req.body.index}`)
          .then((_) => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      });

    const ifIndexExist = await checkIndexExist();
    if (!ifIndexExist) {
      const esResponse = await axios.put(`${esUrl}${req.body.index}`, {
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
    } else {
      res.json("Index exist already");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});


