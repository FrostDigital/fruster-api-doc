require("babel-polyfill");

import React from "react";
import { renderToString } from "react-dom/server";
import App from "./app";
import template from "./template";

const express = require("express");
const uuid = require("uuid");
const app = express();

const bus = require("fruster-bus");
const utils = require("./utils/utils");
const config = require("../config");
const port = process.env.PORT || 3100;

(async function () {

    await bus.connect({
        address: config.bus
    });

    require("fruster-health").start();

    await startServer();

}());

const schemasPerService = {};
const endpointsByType = {
    http: {},
    service: {}
};

function startServer() {

    app.use("/assets", express.static("assets"));

    app.get("/", async (req, res) => {

        const metadataResponses = await bus.requestMany({
            subject: "metadata",
            maxResponses: 10000,
            message: {
                reqId: uuid.v4()
            }
        });

        metadataResponses.forEach(async response => {
            const schemas = await utils.derefJsonSchema(response.data.schemas);

            response.data.exposing.map((object, i) => {
                if (object.subject.includes("http")) {
                    parseEndpoint(object, 2, "http", schemas, response.from.instanceId);
                } else {
                    parseEndpoint(object, 0, "service", schemas, response.from.instanceId);
                }
            });
        });

        /**
         * @param {Object} object response object
         * @param {Number} splitIndex index of endpoint identifier (http.post.>>user<< for http and >>user-service<<.create-user for service).
         * @param {String} type type of endpoint 
         * @param {Array<Object>} schemas schemas for response
         */
        function parseEndpoint(object, splitIndex, type, schemas, instanceId) {
            const splits = object.subject.split(".");

            if (splits[splitIndex] === "health")
                return;

            object.instanceId = instanceId;

            if (!endpointsByType[type][splits[splitIndex]])
                endpointsByType[type][splits[splitIndex]] = [];

            utils.addUnique(object, endpointsByType[type][splits[splitIndex]]);

            if (!schemasPerService[instanceId])
                schemasPerService[instanceId] = schemas;
        }

        const state = { endpointsByType, schemasPerService };
        const appString = renderToString(<App {...state} />);

        const renderedHtml = template({
            body: appString,
            title: "API documentation",
            initialState: JSON.stringify(state)
        });

        res.send(renderedHtml);

    });

    app.listen(port);
    console.log("listening");

    if (process.send) {
        process.send({ event: "online", url: `http://localhost:${port}/` });
    }

}