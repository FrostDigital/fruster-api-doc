require("babel-polyfill");

import React from "react";
import { renderToString } from "react-dom/server";
import App from "./app/App";
import template from "./template";

const express = require("express");
const uuid = require("uuid");
const app = express();
const path = require("path");
const util = require("util");
const fs = require("fs");

const bus = require("fruster-bus");
const log = require("fruster-log");
const utils = require("./utils/utils");
const ViewUtils = require("./utils/ViewUtils");
const config = require("../config");
const port = config.port || 3100;
const compress = require('compression');

const ServiceClientGenerator = require("./utils/service-client-generator/ServiceClientGenerator");
const _ = require("lodash");

let schemasPerService = {};
let endpointsByType = { http: {}, service: {}, ws: {} };
let cachedHtml;

(async function() {

    await bus.connect({ address: config.bus });

    require("fruster-health").start();

    await startServer();

}());

function startServer() {
    app.use(compress()); 

    app.use("/assets", express.static(path.resolve(`${__dirname}/assets`)));

    app.post("/reset-cache", (req, res) => {
        resetCache();

        res.status(200);
        res.end();
    });

    app.get("/service-client/:serviceName", async (req, res) => {
        try {
            const type = "service";
            const serviceName = req.params.serviceName;
            const endpoints = endpointsByType.service[serviceName];

            if (!endpointsByType.service[serviceName]) {
                res.end("<html><body><h1>No data found</h1><h2>run the api doc at least once and try again</h2></body></html>");
                return;
            }

            const options = { serviceName, type, endpoints, subjects: req.query.subjects };

            const serviceClientGenerator = new ServiceClientGenerator(options);
            const className = ViewUtils.replaceAll(_.startCase(serviceName), " ", "") + "Client";

            const file = serviceClientGenerator.toJavascriptClass();

            res.setHeader("Content-type", "application/javascript");
            res.setHeader("Content-disposition", `attachment; filename=${className}.js`);

            res.end(file);
        } catch (err) {
            log.warn(err);
            res.end(`<html><body>Could not generate service client. <br/>Reason:  <br/><code><pre>${util.inspect(err, null, null)}</pre></code></body></html>`);
        }
    });

    app.get("/", async (req, res) => {
        try {
            res.setHeader("Cache-Control", "max-age=300");

            if (req.query.resetCache)
                resetCache();

            /** If there is cached html we send this right away but let the server process the rest, this will speed up avarage load times. */
            if (cachedHtml)
                res.send(cachedHtml);

            let metadataResponses = [];

            if (req.query.project) { /** Lets you input an url to log viewer in order to use that to get metadata */
                const url = `http://${req.query.project}-log-viewer.c4.fruster.se/api/bus/request`;

                console.log("using", url);

                metadataResponses = await utils.httpRequest("POST", url, {
                    maxResponses: 10000,
                    message: {},
                    subject: "metadata"
                });
            } else
                metadataResponses = await bus.requestMany({
                    skipOptionsRequest: true,
                    subject: "metadata",
                    maxResponses: 10000,
                    message: { reqId: uuid.v4() }
                });


            let schemasWithErrors;
            const promises = [];
            const allEndpoints = {};

            metadataResponses.forEach(response => {
                if (!response.from) /** Just in case this happens we don't want the whole page to not load. */
                    response.from = { service: "", instanceId: "" };

                const serviceName = response.from && response.from.service === "n/a" ? response.from.instanceId : response.from ? response.from.service : "na";
                const fixedServiceName = serviceName.replace("n/a", "na");

                if (!response.data)
                    return;

                const promise = utils.derefJsonSchema(response.data.schemas, fixedServiceName)
                    .then((derefResp) => {
                        if (!derefResp)
                            return;

                        const schemas = derefResp.schemas;

                        if (derefResp.errors && Object.keys(derefResp.errors).length > 0) {
                            schemasWithErrors = {};
                            schemasWithErrors[fixedServiceName] = derefResp.errors.map(e => e.id);
                        }

                        response.data.exposing.map((object, i) => {
                            allEndpoints[object.subject] = object.subject;

                            if (object.subject.includes("http")) parseEndpoint(object, 2, "http", schemas, fixedServiceName, response.from.instanceId);
                            else if (object.subject.includes("ws")) parseEndpoint(object, 2, "ws", schemas, fixedServiceName, response.from.instanceId);
                            else parseEndpoint(object, 0, "service", schemas, fixedServiceName, response.from.instanceId);
                        });
                    });

                promises.push(promise);
            });


            await Promise.all(promises);

            Object.keys(endpointsByType).forEach(endpointType => {
                sortAfterEndpointName(endpointsByType[endpointType]);
            });

            const state = { endpointsByType, schemasPerService, schemasWithErrors, allEndpoints, config, generatedDate: new Date().toJSON() };
            const appString = renderToString(<App {...state} />);
            const renderedHtml = template({
                body: appString,
                title: `${config.projectName} API documentation`,
                initialState: JSON.stringify(state).split("\n").join("")
            });

            cachedHtml = renderedHtml;

            if (!res.headersSent)
                res.send(cachedHtml);

        } catch (err) {
            log.error(err);
            res.json(err);
        }
    });

    app.listen(port);
    console.log(` 

================================================
    Fruster
================================================
   █████╗ ██████╗ ██╗    ██████╗  ██████╗  ██████╗
  ██╔══██╗██╔══██╗██║    ██╔══██╗██╔═══██╗██╔════╝
  ███████║██████╔╝██║    ██║  ██║██║   ██║██║     
  ██╔══██║██╔═══╝ ██║    ██║  ██║██║   ██║██║     
  ██║  ██║██║     ██║    ██████╔╝╚██████╔╝╚██████╗
  ╚═╝  ╚═╝╚═╝     ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝
================================================
    Server running at http://localhost:${port}/
================================================
    `);
    console.log(`Server running at http://localhost:${port}/`);
}

/**
 * Parses an endpoint into a format that can be used by the renderer.
 * 
 * @param {Object} object response object
 * @param {Number} splitIndex index of endpoint identifier (http.post.>>user<< for http and >>user-service<<.create-user for service).
 * @param {String} type type of endpoint 
 * @param {Array<Object>} schemas schemas for response
 * @param {String} serviceName name of service
 * @param {String} instanceId 
 */
function parseEndpoint(object, splitIndex, type, schemas, serviceName, instanceId) {
    if (!object.subject) {
        console.log("Could not parse endpoint; No subject...?", object);
        return;
    }

    const splits = object.subject.split(".");

    if (splits[splitIndex] === "health")
        return;

    object.instanceId = instanceId;
    object.serviceName = serviceName;
    object.schemas = schemas;

    if (!endpointsByType[type][splits[splitIndex]])
        endpointsByType[type][splits[splitIndex]] = [];

    endpointsByType[type][splits[splitIndex]] = ViewUtils.addUnique(object, endpointsByType[type][splits[splitIndex]]);

    if (!object.cUrl && object.subject.includes("http"))
        object.cUrl = getCUrlFromEndpoint(object, schemas);

    if (!schemasPerService[serviceName])
        schemasPerService[serviceName] = schemas;
}

/**
 * Generates a cUrl from an endpoint.
 * 
 * @param {Object} endpoint endpoint data
 * @param {Array<Object>} schemas 
 */
function getCUrlFromEndpoint(endpoint, schemas) {
    const requestSchema = schemas.find(s => s && s.id === endpoint.requestSchema);
    const parsedSubject = ViewUtils.parseSubjectToAPIUrl(endpoint.subject);

    let body;

    /** Adds request body if endpoint has a request schema */
    if (requestSchema)
        body = JSON.stringify(requestSchema.sample);

    /** if endpoint uses wildcard method we use GET since wildcard/star is not a valid cUrl method */
    if (parsedSubject.method === "*")
        parsedSubject.method = "GET";

    let authHeader = " ";

    /** Adds a cookie field if authentication is needed to access endpoint */
    if ((endpoint.permissions && endpoint.permissions.length > 0) || endpoint.mustBeLoggedIn)
        authHeader = " --cookie jwt={{JWT_TOKEN}} ";

    const cUrl = `curl -X ${parsedSubject.method} ${authHeader ? `${authHeader}` : ""} ${body ? `-H "Content-Type: application/json" -d '${body}'` : ""} ${config.apiRoot + parsedSubject.url}`;

    return ViewUtils.replaceAll(cUrl, "  ", " ");
}

/**
 * @param {Object} endpoints 
 */
function sortAfterEndpointName(endpoints) {
    if (endpoints) {
        Object.keys(endpoints)
            .forEach(serviceName => {
                endpoints[serviceName] = endpoints[serviceName].sort((a, b) => {
                    const aU = a.subject.toUpperCase();
                    const bU = b.subject.toUpperCase();

                    if (aU > bU) return 1;
                    else if (aU < bU) return -1;
                    else return 0;
                });
            });
    }
}

function resetCache() {
    console.log("Resetting cache");

    schemasPerService = {};
    endpointsByType = { http: {}, service: {}, ws: {} };
    cachedHtml = undefined;

    console.log("Reset result:",
        "\n endpointsByType.http:", Object.keys(endpointsByType.http).length,
        "\n endpointsByType.service:", Object.keys(endpointsByType.service).length,
        "\n endpointsByType.ws:", Object.keys(endpointsByType.ws).length,
        "\n schemasPerService:", Object.keys(schemasPerService).length,
        "\n cachedHtml === undefined:", cachedHtml === undefined);
}