module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _server = __webpack_require__(2);

	var _app = __webpack_require__(3);

	var _app2 = _interopRequireDefault(_app);

	var _template = __webpack_require__(14);

	var _template2 = _interopRequireDefault(_template);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

	__webpack_require__(6);

	var express = __webpack_require__(15);
	var uuid = __webpack_require__(7);
	var app = express();

	var bus = __webpack_require__(16);
	var utils = __webpack_require__(5);
	var config = __webpack_require__(17);
	var port = process.env.PORT || 3100;

	_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	        while (1) {
	            switch (_context.prev = _context.next) {
	                case 0:
	                    _context.next = 2;
	                    return bus.connect({
	                        address: config.bus
	                    });

	                case 2:

	                    __webpack_require__(18).start();

	                    _context.next = 5;
	                    return startServer();

	                case 5:
	                case "end":
	                    return _context.stop();
	            }
	        }
	    }, _callee, this);
	}))();

	var schemasPerService = {};
	var endpointsByType = {
	    http: {},
	    service: {}
	};

	function startServer() {
	    var _this = this;

	    app.use("/assets", express.static("assets"));

	    app.get("/", function () {
	        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
	            var metadataResponses, parseEndpoint, state, appString, renderedHtml;
	            return regeneratorRuntime.wrap(function _callee3$(_context3) {
	                while (1) {
	                    switch (_context3.prev = _context3.next) {
	                        case 0:
	                            parseEndpoint = function parseEndpoint(object, splitIndex, type, schemas, instanceId) {
	                                var splits = object.subject.split(".");

	                                if (splits[splitIndex] === "health") return;

	                                object.instanceId = instanceId;

	                                if (!endpointsByType[type][splits[splitIndex]]) endpointsByType[type][splits[splitIndex]] = [];

	                                utils.addUnique(object, endpointsByType[type][splits[splitIndex]]);

	                                if (!schemasPerService[instanceId]) schemasPerService[instanceId] = schemas;
	                            };

	                            _context3.next = 3;
	                            return bus.requestMany({
	                                subject: "metadata",
	                                maxResponses: 10000,
	                                message: {
	                                    reqId: uuid.v4()
	                                }
	                            });

	                        case 3:
	                            metadataResponses = _context3.sent;


	                            metadataResponses.forEach(function () {
	                                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(response) {
	                                    var schemas;
	                                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
	                                        while (1) {
	                                            switch (_context2.prev = _context2.next) {
	                                                case 0:
	                                                    _context2.next = 2;
	                                                    return utils.derefJsonSchema(response.data.schemas);

	                                                case 2:
	                                                    schemas = _context2.sent;


	                                                    response.data.exposing.map(function (object, i) {
	                                                        if (object.subject.includes("http")) {
	                                                            parseEndpoint(object, 2, "http", schemas, response.from.instanceId);
	                                                        } else {
	                                                            parseEndpoint(object, 0, "service", schemas, response.from.instanceId);
	                                                        }
	                                                    });

	                                                case 4:
	                                                case "end":
	                                                    return _context2.stop();
	                                            }
	                                        }
	                                    }, _callee2, _this);
	                                }));

	                                return function (_x3) {
	                                    return _ref3.apply(this, arguments);
	                                };
	                            }());

	                            /**
	                             * @param {Object} object response object
	                             * @param {Number} splitIndex index of endpoint identifier (http.post.>>user<< for http and >>user-service<<.create-user for service).
	                             * @param {String} type type of endpoint 
	                             * @param {Array<Object>} schemas schemas for response
	                             */
	                            state = { endpointsByType: endpointsByType, schemasPerService: schemasPerService };
	                            appString = (0, _server.renderToString)(_react2.default.createElement(_app2.default, state));
	                            renderedHtml = (0, _template2.default)({
	                                body: appString,
	                                title: "API documentation",
	                                initialState: JSON.stringify(state)
	                            });


	                            res.send(renderedHtml);

	                        case 9:
	                        case "end":
	                            return _context3.stop();
	                    }
	                }
	            }, _callee3, _this);
	        }));

	        return function (_x, _x2) {
	            return _ref2.apply(this, arguments);
	        };
	    }());

	    app.listen(port);
	    console.log("listening");

	    if (process.send) {
	        process.send({ event: "online", url: "http://localhost:" + port + "/" });
	    }
	}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = require("react");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = require("react-dom/server");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var constants = __webpack_require__(4);
	var utils = __webpack_require__(5);

	var App = function (_Component) {
	    _inherits(App, _Component);

	    function App() {
	        _classCallCheck(this, App);

	        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
	    }

	    _createClass(App, [{
	        key: "render",
	        value: function render() {
	            return _react2.default.createElement(
	                "div",
	                { className: "container" },
	                _react2.default.createElement(
	                    "a",
	                    { href: "#" },
	                    _react2.default.createElement(
	                        "h1",
	                        null,
	                        "API"
	                    )
	                ),
	                _react2.default.createElement(
	                    "h4",
	                    null,
	                    "Table of contents"
	                ),
	                _react2.default.createElement(
	                    "ul",
	                    { className: "http" },
	                    forEach(this.props.endpointsByType.http, function (endpoints, serviceName) {
	                        return forEach(endpoints, function (endpoint) {
	                            var parsedSubject = utils.parseSubjectToAPIUrl(endpoint.subject);
	                            return _react2.default.createElement(
	                                "li",
	                                null,
	                                _react2.default.createElement(
	                                    "a",
	                                    { href: "#" + parsedSubject.method + "-to-" + parsedSubject.url },
	                                    _react2.default.createElement(
	                                        "span",
	                                        { className: parsedSubject.method },
	                                        parsedSubject.method
	                                    ),
	                                    " to ",
	                                    parsedSubject.url
	                                )
	                            );
	                        });
	                    })
	                ),
	                _react2.default.createElement(
	                    "ul",
	                    { className: "service" },
	                    forEach(this.props.endpointsByType.service, function (endpoints, serviceName) {
	                        return forEach(endpoints, function (endpoint) {
	                            return _react2.default.createElement(
	                                "li",
	                                null,
	                                _react2.default.createElement(
	                                    "a",
	                                    { href: "#" + endpoint.subject },
	                                    endpoint.subject
	                                )
	                            );
	                        });
	                    })
	                ),
	                _react2.default.createElement("div", { className: "clearfix" }),
	                _react2.default.createElement(
	                    "a",
	                    { href: "#http-endpoints" },
	                    _react2.default.createElement(
	                        "h1",
	                        { id: "http-endpoints" },
	                        "Http endpoints"
	                    )
	                ),
	                listEndpointDetails(this.props.endpointsByType.http, "http"),
	                _react2.default.createElement(
	                    "a",
	                    { href: "#service-endpoints" },
	                    _react2.default.createElement(
	                        "h1",
	                        { id: "service-endpoints" },
	                        "Service endpoints"
	                    )
	                ),
	                listEndpointDetails(this.props.endpointsByType.service),
	                _react2.default.createElement("br", null),
	                _react2.default.createElement(
	                    "div",
	                    { id: "modal", className: "modal fade bd-example-modal-lg", role: "dialog", "aria-labelledby": "myLargeModalLabel", "aria-hidden": "true" },
	                    _react2.default.createElement(
	                        "div",
	                        { className: "modal-dialog modal-lg" },
	                        _react2.default.createElement(
	                            "div",
	                            { className: "modal-content" },
	                            _react2.default.createElement("h1", { id: "header" }),
	                            _react2.default.createElement(
	                                "h2",
	                                null,
	                                "Json schema"
	                            ),
	                            _react2.default.createElement("div", { id: "json-schema" }),
	                            _react2.default.createElement(
	                                "button",
	                                { id: "copy-json-schema-json" },
	                                "Toggle raw json"
	                            ),
	                            _react2.default.createElement("textarea", { hidden: true, id: "json-schema-json" }),
	                            _react2.default.createElement(
	                                "h2",
	                                null,
	                                "Sample"
	                            ),
	                            _react2.default.createElement("div", { id: "json-sample" }),
	                            _react2.default.createElement(
	                                "button",
	                                { id: "copy-sample-json" },
	                                "Toggle raw json"
	                            ),
	                            _react2.default.createElement("textarea", { hidden: true, id: "sample-json" })
	                        )
	                    )
	                )
	            );
	        }
	    }]);

	    return App;
	}(_react.Component);

	exports.default = App;


	function listEndpointDetails(endpointsJson, type) {
	    return forEach(endpointsJson, function (endpoints, serviceName) {
	        return _react2.default.createElement(
	            "div",
	            { className: "service-container " + serviceName },
	            _react2.default.createElement(
	                "a",
	                { href: "#" + serviceName },
	                _react2.default.createElement(
	                    "h2",
	                    { id: serviceName },
	                    serviceName
	                )
	            ),
	            forEach(endpoints, function (endpoint) {
	                var parsedSubject = utils.parseSubjectToAPIUrl(endpoint.subject);

	                return _react2.default.createElement(
	                    "div",
	                    { className: "container" },
	                    type === "http" ? _react2.default.createElement(
	                        "span",
	                        null,
	                        _react2.default.createElement(
	                            "a",
	                            { href: "#" + parsedSubject.method + "-to-" + parsedSubject.url },
	                            _react2.default.createElement(
	                                "h3",
	                                { id: parsedSubject.method + "-to-" + parsedSubject.url },
	                                _react2.default.createElement(
	                                    "span",
	                                    { className: parsedSubject.method },
	                                    parsedSubject.method
	                                ),
	                                " to ",
	                                parsedSubject.url
	                            )
	                        ),
	                        "from ",
	                        endpoint.instanceId
	                    ) : _react2.default.createElement(
	                        "span",
	                        null,
	                        " ",
	                        _react2.default.createElement(
	                            "a",
	                            { href: "#" + endpoint.subject },
	                            _react2.default.createElement(
	                                "h3",
	                                { id: endpoint.subject },
	                                endpoint.subject
	                            )
	                        ),
	                        " from ",
	                        endpoint.instanceId
	                    ),
	                    _react2.default.createElement(
	                        "table",
	                        { className: "table table-hover" },
	                        _react2.default.createElement(
	                            "thead",
	                            null,
	                            _react2.default.createElement(
	                                "tr",
	                                null,
	                                _react2.default.createElement(
	                                    "th",
	                                    null,
	                                    "Subject"
	                                ),
	                                _react2.default.createElement(
	                                    "th",
	                                    null,
	                                    "Must be logged in"
	                                ),
	                                _react2.default.createElement(
	                                    "th",
	                                    null,
	                                    "Required permissions"
	                                )
	                            )
	                        ),
	                        _react2.default.createElement(
	                            "tbody",
	                            null,
	                            _react2.default.createElement(
	                                "tr",
	                                null,
	                                _react2.default.createElement(
	                                    "td",
	                                    null,
	                                    endpoint.subject
	                                ),
	                                _react2.default.createElement(
	                                    "td",
	                                    { className: endpoint.mustBeLoggedIn.toString() },
	                                    endpoint.mustBeLoggedIn.toString()
	                                ),
	                                _react2.default.createElement(
	                                    "td",
	                                    null,
	                                    endpoint.permissions || "none"
	                                )
	                            )
	                        ),
	                        _react2.default.createElement(
	                            "thead",
	                            null,
	                            _react2.default.createElement(
	                                "tr",
	                                null,
	                                _react2.default.createElement(
	                                    "th",
	                                    null,
	                                    "Request body"
	                                ),
	                                _react2.default.createElement(
	                                    "th",
	                                    null,
	                                    "Response body"
	                                ),
	                                _react2.default.createElement(
	                                    "th",
	                                    null,
	                                    "Description"
	                                )
	                            )
	                        ),
	                        _react2.default.createElement(
	                            "tbody",
	                            null,
	                            _react2.default.createElement(
	                                "tr",
	                                null,
	                                _react2.default.createElement(
	                                    "td",
	                                    { className: "request-schema" + " " + endpoint.instanceId + " " + endpoint.requestSchema },
	                                    endpoint.requestSchema || "n/a"
	                                ),
	                                _react2.default.createElement(
	                                    "td",
	                                    { className: "response-schema" + " " + endpoint.instanceId + " " + endpoint.responseSchema },
	                                    endpoint.responseSchema || "n/a"
	                                ),
	                                _react2.default.createElement(
	                                    "td",
	                                    null,
	                                    endpoint.description || "n/a"
	                                )
	                            )
	                        )
	                    )
	                );
	            })
	        );
	    });
	}

	function forEach(toLoop, handler) {
	    return Object.keys(toLoop).sort().map(function (index) {
	        return handler(toLoop[index], index);
	    });
	}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = {};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

	__webpack_require__(6);

	var uuid = __webpack_require__(7);
	var constants = __webpack_require__(4);
	var fs = __webpack_require__(8);
	var path = __webpack_require__(9);

	var filePath = path.resolve(__dirname + "/json-schemas");
	var JsonSchemaCruncher = __webpack_require__(10);
	var jsonSchemaCruncher = new JsonSchemaCruncher(filePath);
	var jsf = __webpack_require__(13);

	jsf.option({
	    requiredOnly: false,
	    alwaysFakeOptionals: true,
	    failOnInvalidTypes: false
	});

	module.exports = {

	    /**
	     * @typedef {Object} ParsedSubject
	     * @property {String} method
	     * @property {String} url
	     */

	    /**
	     * Parses a subject, picks out the method and transforms to url.
	     * 
	     * @param {String} subject
	     * 
	     * @return {ParsedSubject}
	     */
	    parseSubjectToAPIUrl: function parseSubjectToAPIUrl(subject) {
	        var outputURL = subject;
	        outputURL = module.exports.replaceAll(outputURL, ".", "/");
	        outputURL = outputURL.replace("http/", "");

	        var indexOfFirstSlash = outputURL.indexOf("/");
	        var method = outputURL.substring(0, indexOfFirstSlash);

	        outputURL = outputURL.substring(indexOfFirstSlash);

	        return {
	            method: method.toUpperCase(),
	            url: outputURL
	        };
	    },

	    /**
	     * Replaces all instances of word in string
	     * 
	     * @param {String} target target string
	     * @param {String} search string to be replaced
	     * @param {String} replacement string to replace with
	     * 
	     * @return {String} {target} string with {search} replaced by {replacement}
	     */
	    replaceAll: function replaceAll(target, search, replacement) {
	        return target.split(search).join(replacement);
	    },

	    /**
	     * Adds item to array only if it does not already exist.
	     * 
	     * @param {Object} object object to add to array
	     * @param {Array} array array to add object to
	     * 
	     * @return {Void}
	     */
	    addUnique: function addUnique(object, array) {
	        var objectExists = !!array.find(function (o) {
	            return o.subject === object.subject;
	        });

	        if (!objectExists) array.push(object);
	    },

	    /**
	     * derefs json schemas
	     * 
	     * @param {Array<Object>} schemas schemas to save to folder
	     * 
	     * @return {Promise<Array<Object>>}
	     */
	    derefJsonSchema: function () {
	        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(schemas) {
	            var schemaPromises;
	            return regeneratorRuntime.wrap(function _callee$(_context) {
	                while (1) {
	                    switch (_context.prev = _context.next) {
	                        case 0:
	                            _context.next = 2;
	                            return jsonSchemaCruncher.buildContext("", schemas);

	                        case 2:
	                            schemaPromises = [];


	                            schemas.forEach(function (schema) {
	                                schemaPromises.push(jsonSchemaCruncher.getSchema(schema.id).then(function (schema) {
	                                    setFakerSpecificAttrs(schema);

	                                    schema.sample = jsf(schema);
	                                    return schema;
	                                }));
	                            });

	                            _context.next = 6;
	                            return Promise.all(schemaPromises);

	                        case 6:
	                            return _context.abrupt("return", _context.sent);

	                        case 7:
	                        case "end":
	                            return _context.stop();
	                    }
	                }
	            }, _callee, undefined);
	        }));

	        function derefJsonSchema(_x) {
	            return _ref.apply(this, arguments);
	        }

	        return derefJsonSchema;
	    }()
	};

	/**
	 * Searches json objects and adds faker specifics.
	 * 
	 * @param {Object} object 
	 * 
	 * @return {Void}
	 */
	function setFakerSpecificAttrs(object) {

	    Object.keys(object).forEach(function (key) {
	        if (object.hasOwnProperty(key)) {
	            if (_typeof(object[key]) === "object") {
	                setFakerSpecificAttrs(object[key]);
	            }

	            switch (object[key]) {
	                case "uuid":
	                    object["faker"] = "random.uuid";
	                    break;
	                case "uri":
	                    object["faker"] = "internet.url";
	                    break;
	            }

	            switch (key) {
	                case "email":
	                    object[key]["faker"] = "internet.email";
	                    break;
	                case "password":
	                    object[key]["faker"] = "internet.password";
	                    break;

	                case "firstName":
	                    object[key]["faker"] = "name.firstName";
	                    break;
	                case "middleName":
	                    object[key]["faker"] = "name.firstName";
	                    break;
	                case "lastName":
	                    object[key]["faker"] = "name.lastName";
	                    break;
	            }
	        }
	    });
	}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = require("babel-polyfill");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	module.exports = require("uuid");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	module.exports = require("fs-extra");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	module.exports = require("path");

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var $RefParser = __webpack_require__(11);
	var os = __webpack_require__(12);
	var fs = __webpack_require__(8);
	var path = __webpack_require__(9);

	var JsonSchemaCruncher = function () {
		function JsonSchemaCruncher(tempDir) {
			_classCallCheck(this, JsonSchemaCruncher);

			console.log("tempDir", tempDir);
			this.tempDir = tempDir || os.tmpdir();
		}

		_createClass(JsonSchemaCruncher, [{
			key: "getSchema",
			value: function getSchema(schemaId) {
				var schemaPath = path.join(this.schemasDir, schemaId);
				return $RefParser.dereference(schemaPath);
			}
		}, {
			key: "buildContext",
			value: function () {
				var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(serviceName, bundle) {
					return regeneratorRuntime.wrap(function _callee$(_context) {
						while (1) {
							switch (_context.prev = _context.next) {
								case 0:
									_context.next = 2;
									return this._writeJsonSchemas(serviceName, bundle);

								case 2:
								case "end":
									return _context.stop();
							}
						}
					}, _callee, this);
				}));

				function buildContext(_x, _x2) {
					return _ref.apply(this, arguments);
				}

				return buildContext;
			}()
		}, {
			key: "_writeJsonSchemas",
			value: function () {
				var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(serviceName, bundle) {
					var _this = this;

					return regeneratorRuntime.wrap(function _callee3$(_context3) {
						while (1) {
							switch (_context3.prev = _context3.next) {
								case 0:
									this.schemasDir = path.join(this.tempDir, serviceName);

									_context3.next = 3;
									return fs.ensureDir(this.schemasDir);

								case 3:
									_context3.next = 5;
									return bundle.map(function () {
										var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(jsonSchema) {
											var filePath;
											return regeneratorRuntime.wrap(function _callee2$(_context2) {
												while (1) {
													switch (_context2.prev = _context2.next) {
														case 0:
															filePath = path.join(_this.schemasDir, jsonSchema.id);

															console.log(filePath);
															return _context2.abrupt("return", fs.writeJson(filePath, jsonSchema));

														case 3:
														case "end":
															return _context2.stop();
													}
												}
											}, _callee2, _this);
										}));

										return function (_x5) {
											return _ref3.apply(this, arguments);
										};
									}());

								case 5:
								case "end":
									return _context3.stop();
							}
						}
					}, _callee3, this);
				}));

				function _writeJsonSchemas(_x3, _x4) {
					return _ref2.apply(this, arguments);
				}

				return _writeJsonSchemas;
			}()
		}]);

		return JsonSchemaCruncher;
	}();

	module.exports = JsonSchemaCruncher;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	module.exports = require("json-schema-ref-parser");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	module.exports = require("os");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	module.exports = require("json-schema-faker");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports.default = function (_ref) {
	  var body = _ref.body,
	      title = _ref.title,
	      initialState = _ref.initialState;

	  return "\n<!DOCTYPE html>\n<html>\n\n<head>\n  <script>window._APP_STATE_ = " + initialState + ";</script>\n  <title>" + title + "</title>\n  <link rel=\"stylesheet\" href=\"/assets/index.css\" />\n  <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\"/>\n</head>\n\n<body>\n  <div id=\"root\">" + body + "</div>\n</body>\n\n<script src=\"https://code.jquery.com/jquery-3.1.0.js\" integrity=\"sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk=\" crossorigin=\"anonymous\"></script>\n<script type=\"text/javascript\" src=\"https://cdnjs.cloudflare.com/ajax/libs/json-schema-faker/0.3.4/json-schema-faker.min.js\"></script>\n<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n<script src=\"assets/client.js\"></script>\n<script src=\"assets/babel-polyfill.js\"/>\n\n\n<browser-refresh enabled=\"true\" />\n\n\n</html>\n";
	};

	//<script src="/assets/bundle.js"></script>

/***/ }),
/* 15 */
/***/ (function(module, exports) {

	module.exports = require("express");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	module.exports = require("fruster-bus");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = {

	    bus: process.env.BUS || "nats://localhost:4222",

	    port: parseInt(process.env.PORT || 8080, 10)

	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	const conf = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./conf\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	const log = __webpack_require__(19);
	const HealthCheck = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/health-check\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	module.exports = {

	  start: () => {
	    log.info("Starting health checks (grace period " + conf.gracePeriod + ")");

	    return new HealthCheck({
	      appName: conf.appName,
	      checkInterval: conf.checkInterval,
	      gracePeriod: conf.gracePeriod,
	      allowedFailedAttempts: conf.allowedFailedAttempts,
	      bus: conf.bus
	    }).start();
	  }

	};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	module.exports = require("fruster-log");

/***/ })
/******/ ]);