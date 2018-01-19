require("babel-polyfill");

import React from "react";
import { renderToString } from "react-dom/server";
import App from "./app";
import template from "./template";

const express = require("express");
const uuid = require("uuid");
const app = express();
const path = require("path");

const bus = require("fruster-bus");
const log = require("fruster-log");
const utils = require("./utils/utils");
const config = require("../config");
const port = config.port || 3100;

(async function () {

    await bus.connect({
        address: config.bus
    });

    require("fruster-health").start();

    await startServer();

}());

let schemasPerService = {};
let endpointsByType = {
    http: {},
    service: {},
    ws: {}
};

function startServer() {

    app.use("/assets", express.static(path.resolve(`${__dirname}/assets`)));

    app.post("/reset-cache", (req, res) => {
        console.log("Resetting cache");

        schemasPerService = {};
        endpointsByType = {
            http: {},
            service: {},
            ws: {}
        };

        res.status(200);
        res.end();
    });

    app.get("/", async (req, res) => {
        try {
            if (req.query.resetCache) {
                schemasPerService = {};
                endpointsByType = {
                    http: {},
                    service: {},
                    ws: {}
                };
            }

            const metadataResponses = await bus.requestMany({
                subject: "metadata",
                maxResponses: 10000,
                message: {
                    reqId: uuid.v4()
                }
            });
            /**@type {Object<String, Array>} serviceName: [JsonSchemaId]*/
            let schemasWithErrors;
            const promises = [];

            metadataResponses.forEach(response => {
                const serviceName = response.from.service === "n/a" ? response.from.instanceId : response.from.service;
                const fixedServiceName = serviceName.replace("n/a", "na");

                const promise = utils.derefJsonSchema(response.data.schemas, fixedServiceName)
                    .then((derefResp) => {
                        const schemas = derefResp.schemas;

                        if (derefResp.errors && Object.keys(derefResp.errors).length > 0) {
                            schemasWithErrors = {};
                            schemasWithErrors[fixedServiceName] = derefResp.errors.map(e => e.id);
                        }
                        response.data.exposing.map((object, i) => {
                            if (object.subject.includes("http")) {
                                parseEndpoint(object, 2, "http", schemas, fixedServiceName, response.from.instanceId);
                            } else if (object.subject.includes("ws")) {
                                parseEndpoint(object, 2, "ws", schemas, fixedServiceName, response.from.instanceId);
                            } else {
                                parseEndpoint(object, 0, "service", schemas, fixedServiceName, response.from.instanceId);
                            }
                        });
                    });

                promises.push(promise);
            });

            await Promise.all(promises);

            /**
             * @param {Object} object response object
             * @param {Number} splitIndex index of endpoint identifier (http.post.>>user<< for http and >>user-service<<.create-user for service).
             * @param {String} type type of endpoint 
             * @param {Array<Object>} schemas schemas for response
             * @param {String} serviceName name of service
             * @param {String} instanceId 
             */
            function parseEndpoint(object, splitIndex, type, schemas, serviceName, instanceId) {
                const splits = object.subject.split(".");

                if (splits[splitIndex] === "health")
                    return;

                object.instanceId = instanceId;
                object.serviceName = serviceName;

                if (!endpointsByType[type][splits[splitIndex]])
                    endpointsByType[type][splits[splitIndex]] = [];

                endpointsByType[type][splits[splitIndex]] = utils.addUnique(object, endpointsByType[type][splits[splitIndex]]);

                if (!schemasPerService[serviceName])
                    schemasPerService[serviceName] = schemas;
            }

            Object.keys(endpointsByType).forEach(endpointType => {
                sortAfterEndpointName(endpointsByType[endpointType]);
            });

            const state = {
                endpointsByType, schemasPerService, schemasWithErrors
            };
            const appString = renderToString(<App {...state} />);

            const renderedHtml = template({
                body: appString,
                title: `${config.projectName} API documentation`,
                initialState: JSON.stringify(state)
            });

            res.send(renderedHtml);
        } catch (err) {
            log.error(err);
            res.json(err);
        }
    });

    app.listen(port);
    console.log("listening");

    if (process.send) {
        process.send({ event: "online", url: `http://localhost:${port}/` });
    }

}

/**
 * @param {Object} endpoints 
 */
function sortAfterEndpointName(endpoints) {
    if (endpoints) {
        const array = [];

        Object.keys(endpoints)
            .forEach(serviceName => {
                endpoints[serviceName] = endpoints[serviceName].sort((a, b) => {
                    const aU = a.subject.toUpperCase();
                    const bU = b.subject.toUpperCase();

                    if (aU > bU)
                        return 1;
                    else if (aU < bU)
                        return -1;
                    else
                        return 0;
                });
            });
    }
}