require("source-map-support").install();
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("mongodb");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(2);
var app = new express();
var graphqlHTTP = __webpack_require__(3);

var _require = __webpack_require__(4),
    graphql = _require.graphql,
    buildSchema = _require.buildSchema;

var MongoClient = __webpack_require__(0).MongoClient;
var ObjectId = __webpack_require__(0).ObjectId;
var url = 'mongodb://localhost:27017/coola';
var prodUrl = 'mongodb://branson:a323573770@ds141082.mlab.com:41082/coola';
var request = __webpack_require__(5);

if (process.env.NODE_ENV == 'production') {
    url = prodUrl;
}

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log(err);
        console.log("could not connet to the database");
    } else {
        console.log("database connected succesfully");
    }
    var schema = buildSchema('\n          type Query {\n            hello: String,\n            Type(_id: String):Type,\n            Types:[Type],\n            Prop:Prop,\n            Props:[Prop],\n            Project(_id: String):Project,\n            Projects:[Project],\n            Relationship:Relationship,\n            Relationships:[Relationship]\n          }\n\n          type Mutation {\n           addType(\n            name: String,\n            Project:String!,\n            description:String,\n           ): String,\n\n           removeType(\n            _id: String,\n           ): String,\n\n           addProject(\n              name: String,\n              description: String,\n           ):String\n\n           removeProject(\n            _id: String,\n           ): String,\n\n           addProp(\n             name: String,\n             list: Boolean,\n             Parent:String,\n             Type:String,\n             required:Boolean,\n             description:String,\n           ): String,\n\n           removeProp(\n            _id: String,\n           ): String,\n          }\n\n          type Project {\n            _id: String,\n            name: String,\n            Types:[Type]\n          }\n\n          type Type {\n            _id: String,\n            name: String,\n            description : String,\n            Props:[Prop]\n          }\n\n          type Prop {\n            _id: String,\n            Parent:Type,\n            list: Boolean,\n            required:Boolean,\n            description:String,\n            name: String,\n            Type:String\n          }\n\n          type Relationship {\n            _id: String,\n            origin: Type,\n            target: Type,\n          }\n        ');

    var types = [];

    var rootValue = {
        hello: function hello() {
            return 'Hello world!';
        },
        Type: function Type(_ref) {
            var _id = _ref._id;
            return new Promise(function (res, rej) {
                var col = db.collection("Types");
                console.log(_id);
                col.findOne({ _id: new ObjectId(_id) }, function (err, data) {
                    !data ? "" : data.Props = function () {
                        return new Promise(function (res, rej) {
                            var col = db.collection("Props");
                            col.find({ Parent: new ObjectId(data._id) }).toArray(function (err, data) {
                                res(data);
                            });
                        });
                    };
                    console.log(data);
                    res(data);
                });
            });
        },
        Types: function Types() {
            return new Promise(function (res, rej) {
                var col = db.collection("Types");
                col.find().toArray(function (err, data) {
                    data.forEach(function (item) {
                        item.Props = function () {
                            return new Promise(function (res, rej) {
                                var col = db.collection("Props");
                                col.find({ Parent: new ObjectId(item._id) }).toArray(function (err, data) {
                                    res(data);
                                });
                            });
                        };
                    });
                    res(data);
                });
            });
        },
        Project: function Project(_ref2) {
            var _id = _ref2._id;
            return new Promise(function (res, rej) {
                var col = db.collection("Projects");
                console.log(_id);
                col.findOne({ _id: new ObjectId(_id) }, function (err, data) {
                    !data ? "" : data.Types = function () {
                        return new Promise(function (res, rej) {
                            var col = db.collection("Types");
                            col.find({ Project: new ObjectId(data._id) }).toArray(function (err, data) {
                                data.forEach(function (item) {
                                    item.Props = function () {
                                        return new Promise(function (res, rej) {
                                            var col = db.collection("Props");
                                            col.find({ Parent: new ObjectId(item._id) }).toArray(function (err, data) {
                                                res(data);
                                            });
                                        });
                                    };
                                });
                                res(data);
                            });
                        });
                    };
                    console.log(data);
                    res(data);
                });
            });
        },
        Projects: function Projects() {
            return new Promise(function (res, rej) {
                var col = db.collection("Projects");
                col.find().toArray(function (err, data) {
                    data.forEach(function (item) {
                        item.Props = function () {
                            return new Promise(function (res, rej) {
                                var col = db.collection("Props");
                                col.find().toArray(function (err, data) {
                                    res(data);
                                });
                            });
                        };
                    });
                    res(data);
                });
            });
        },
        addProject: function addProject(args) {
            return new Promise(function (res, rej) {
                var col = db.collection("Projects");
                col.insertOne(args, function (err, data) {
                    res(data);
                });
            });
        },
        addType: function addType(args) {
            return new Promise(function (res, rej) {
                var col = db.collection("Types");
                args.Project = new ObjectId(args.Project);
                col.insertOne(args, function (err, data) {
                    res(data);
                });
            });
        },
        addProp: function addProp(args) {
            return new Promise(function (res, rej) {
                var col = db.collection("Props");
                args.Parent = new ObjectId(args.Parent);
                col.insertOne(args, function (err, data) {
                    res(data);
                });
            });
        }
    };

    app.use(express.static('./www'));

    app.use('/graphql', graphqlHTTP({
        schema: schema,
        rootValue: rootValue,
        graphiql: true
    }));

    app.use('/graphql2/:project_id', function (req, res, next) {
        makeSchema(req.params.project_id).then(function (schema) {
            req.schema = schema;
            next();
        });
    }, function (req, res, next) {
        var middleware = graphqlHTTP({
            schema: req.schema,
            rootValue: rootValue,
            graphiql: true
        });

        middleware(req, res, next);
    });

    var port = process.env.PORT || 3000;

    app.listen(port, function () {
        return console.log('Started listening at ' + port, url);
    });
});

function decorate(prop) {
    var finalRes = spaceToSnake(prop.Type);

    if (prop.Type) if (prop.list == true) {
        finalRes = '[' + finalRes + ']';
    }

    if (prop.required == true) {
        finalRes = finalRes + '!';
    }

    return finalRes;
}

function decorate_input(prop) {
    var basicTypes = ['Int', 'String', 'Boolean', 'Float'];

    var finalRes = spaceToSnake(prop.Type);

    if (basicTypes.indexOf(finalRes) == -1) {
        finalRes = "input_" + spaceToSnake(prop.Type);
    }

    if (prop.list == true) {
        finalRes = '[' + finalRes + ']';
    }

    if (prop.required == true) {
        finalRes = finalRes + '!';
    }

    return finalRes;
}

function spaceToSnake(string) {
    return string.replace(/ /g, "_");
}

function checkIfPropRequireList(prop) {
    var finalRes = spaceToSnake(prop.name);

    if (prop.list == true) {
        finalRes = finalRes + '(first:Int,after:String,offSet:Int)';
    }

    return finalRes;
}

function makeSchema(project_id) {
    return new Promise(function (res, rej) {
        var url = 'http://localhost:3000/graphql';
        if (process.env.NODE_ENV == 'production') {
            url = "https://guarded-spire-97737.herokuapp.com/graphql";
        }
        request.post({
            url: url,
            form: {
                query: 'query te($project:String){\n                                    Project(_id:$project){\n                                      Types {\n                                        _id\n                                        name,\n                                        description,\n                                        Props{\n                                          _id,\n                                          name,\n                                          required,\n                                          description,\n                                          list,\n                                          Type\n                                        }\n                                      }\n                                    }\n                                  }',
                variables: JSON.stringify({
                    project: project_id
                })
            }
        }, function (err, result) {
            console.log(err || result.body);
            var data = JSON.parse(result.body).data.Project;

            console.log(data);
            var queries = '\n                            type Query {\n                              ' + data.Types.map(function (type) {
                return '\n# ' + type.description + ' \n \n                                ' + spaceToSnake(type.name.toString()) + '(_id:String) : ' + spaceToSnake(type.name.toString());
            }).join(" ") + '\n                              \n                              ' + data.Types.map(function (type) {
                return '\n# list of ' + type.description + ' \n \n                                ' + spaceToSnake(type.name.toString()) + 's : [' + spaceToSnake(type.name.toString()) + ']';
            }).join(" ") + '\n                            }\n\n                            ' + data.Types.map(function (propContaining) {
                return '\n# ' + propContaining.description + '\n type ' + spaceToSnake(propContaining.name) + ' {\n                              ' + propContaining.Props.map(function (prop) {
                    return '\n# ' + prop.description + ' \n \n                                ' + checkIfPropRequireList(prop) + ': ' + decorate(prop);
                }).join(" ") + '\n                            }';
            }).join(" ") + '\n            ';
            var mutations = '\n              type Mutation {\n                ' + data.Types.map(function (type) {
                return '\n# ' + type.description + ' \n\n                  ' + spaceToSnake(type.name.toString()) + 'Mutations : ' + spaceToSnake(type.name.toString()) + 'Mutations';
            }).join(" ") + '\n              }\n\n              ' + data.Types.map(function (type) {
                return 'type ' + spaceToSnake(type.name) + 'Mutations {\n                      Create(\n                          ' + spaceToSnake(type.name) + ':input_' + spaceToSnake(type.name) + '\n                      ): ' + spaceToSnake(type.name) + ',\n\n                      Update(\n                          ' + spaceToSnake(type.name) + ':input_' + spaceToSnake(type.name) + '\n                      ): ' + spaceToSnake(type.name) + ',\n\n                      Delete(\n                          ' + spaceToSnake(type.name) + ':input_' + spaceToSnake(type.name) + '\n                      ): ' + spaceToSnake(type.name) + '\n                  }';
            }) + '\n              \n\n              ' + data.Types.map(function (propContaining) {
                return '\n# ' + propContaining.description + '\n input input_' + spaceToSnake(propContaining.name) + ' {\n                ' + propContaining.Props.map(function (prop) {
                    return '\n# ' + prop.description + ' \n ' + spaceToSnake(prop.name) + ': ' + decorate_input(prop);
                }).join(" ") + '\n              }';
            }).join(" ") + '\n            ';

            res(buildSchema(queries + mutations));
        });
    });
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("express-graphql");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("graphql");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("request");

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map