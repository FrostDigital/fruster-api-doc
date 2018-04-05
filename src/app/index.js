import React, { Component } from "react";
const constants = require("../constants");
const utils = require("../utils/utils");
const config = require("../../config");


export default class App extends Component {

    render() {
        return (
            <span>

                <div className="toolbar">
                    <button className="btn btn-danger btn-xs" id="reset-cache">Reset cache</button>
                    <div className="clearfix"></div>
                </div>

                <div className="container">
                    <div className="alert alert-danger" id="try-again-warning" hidden>
                        <strong>Note:</strong> Something went wrong or there are no endpoints registered; <a id="refresh-page" href="#">please refresh the page.</a>
                    </div>

                    {this.props.schemasWithErrors ? <div className="alert alert-danger" id="schemas-contains-errors">
                        <strong>Note:</strong>Errors were detected in the following json schemas:
                        {
                            this.forEach(this.props.schemasWithErrors, (schemas, serviceName) => {

                                return this.forEach(schemas, (schemaWithError) => {

                                    return <li className={"request-schema" + " " + serviceName + " " + schemaWithError}>
                                        <a href="" >{schemaWithError} <span className="glyphicon glyphicon-new-window"></span></a> from {serviceName}
                                    </li>
                                })
                            })
                        }
                    </div> : ""}

                    <a href="#"><h1>{config.projectName ? config.projectName + " " : ""}API</h1></a>

                    <h4>Table of contents</h4>
                    <div className="row table-of-contents">
                        <div className="col-md-6">
                            <ul className="http">
                                <a href="#http-endpoints"><h3>Http endpoints</h3></a>
                                {this.forEach(this.props.endpointsByType.http, (endpoints, serviceName) => {
                                    return <span>

                                        <a href={"#" + serviceName + "-http"}><h4>{serviceName}</h4></a>

                                        {this.forEach(endpoints, (endpoint) => {
                                            const parsedSubject = utils.parseSubjectToAPIUrl(endpoint.subject);
                                            return <li className={endpoint.deprecated ? "deprecated" : ""}><a href={"#" + parsedSubject.method + "-to-" + parsedSubject.url}><span className={parsedSubject.method}>{parsedSubject.method}</span> to {parsedSubject.url}</a></li>
                                        })}

                                    </span>
                                })}
                            </ul>
                        </div>

                        {this.tableOfContents("Service")}
                        {this.tableOfContents("Ws")}

                    </div>

                    <div className="clearfix"></div>

                    <a href="#http-endpoints"><h1 id="http-endpoints">Http endpoints</h1></a>
                    {this.listEndpointDetails(this.props.endpointsByType.http, "http")}

                    <a href="#ws-endpoints"><h1 id="ws-endpoints">Ws endpoints</h1></a>
                    {this.listEndpointDetails(this.props.endpointsByType.ws, "ws")}

                    <a href="#service-endpoints"><h1 id="service-endpoints">Service endpoints</h1></a>
                    {this.listEndpointDetails(this.props.endpointsByType.service)}

                    <br />

                    <div id="modal" className="modal fade bd-example-modal-lg" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" >
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <span className="glyphicon glyphicon-remove close" id="close-btn"></span>
                                <h1 id="header"></h1>

                                <a href="#schema">
                                    <div>Go to json Schema</div>
                                </a>
                                <a href="#sample">
                                    <div>Go to sample</div>
                                </a>

                                <br />

                                <h2 id="schema">Json schema</h2>

                                <button className="action btn-copy" id="copy-json-schema">
                                    <input id="copy-json-schema-json" type="text" value="" hidden /> Copy to clipboard <span className="glyphicon glyphicon-copy"></span>
                                </button>

                                <div className="clearfix" />

                                <pre>
                                    <code id="json-schema-json"></code>
                                </pre>

                                <h2 id="sample">Sample</h2>

                                <button className="action btn-copy" id="copy-sample">
                                    <input id="copy-sample-json" type="text" value="" hidden /> Copy to clipboard <span className="glyphicon glyphicon-copy"></span>
                                </button>

                                <div className="clearfix" />

                                <pre>
                                    <code id="sample-json"></code>
                                </pre>
                            </div>
                        </div>
                    </div>

                </div>
            </span>
        );
    }

    /**
     * Renders table of contents for a type of endpoints.
     * 
     * @param {String} type 
     */
    tableOfContents(type) {
        return <div className="col-md-6">
            <ul className={type.toLowerCase()}>
                <a href={"#" + type.toLowerCase() + "-endpoints"}><h3>{type} endpoints</h3></a>
                {this.forEach(this.props.endpointsByType[type.toLowerCase()], (endpoints, serviceName) => {
                    return <span>
                        <a href={"#" + serviceName + "-" + type.toLowerCase()}><h4>{serviceName}</h4></a>
                        {this.forEach(endpoints, (endpoint) => {
                            return <li className={endpoint.deprecated ? "deprecated" : ""}>
                                <a dangerouslySetInnerHTML={{ __html: this.getColorCodedTitle(endpoint.subject) }} href={"#" + endpoint.subject}></a>
                            </li>
                        })}
                    </span>
                })}
            </ul>
        </div>;
    }

    /**
     * Renders the details for an endpoint.
     * 
     * @param {Object} endpointsJson 
     * @param {String=} type 
     */
    listEndpointDetails(endpointsJson, type) {
        return this.forEach(endpointsJson, (endpoints, serviceName) => {
            return <div id={serviceName + "-" + (type || "service")} className={"service-container " + serviceName + "-"}>
                <a href={"#" + serviceName + "-" + (type || "service")}><h2>{serviceName}</h2></a>

                {this.forEach(endpoints, endpoint => {
                    const parsedSubject = utils.parseSubjectToAPIUrl(endpoint.subject);

                    if (type === "http") {
                        endpoint.urlSubjectLink = `${parsedSubject.method}-to-${parsedSubject.url}`;
                        endpoint.urlSubject = `<span class="${parsedSubject.method}">${parsedSubject.method}</span> to ${parsedSubject.url}`;
                    } else {
                        endpoint.urlSubjectLink = endpoint.subject;
                        endpoint.urlSubject = this.getColorCodedTitle(endpoint.subject);
                    }

                    return <div id={endpoint.urlSubjectLink} className={(endpoint.deprecated ? "deprecated-container" : "") + " container endpoint-container"}>
                        <span>
                            <span>
                                <a href={"#" + endpoint.urlSubjectLink}>
                                    <h3 className={endpoint.deprecated ? "deprecated" : ""} dangerouslySetInnerHTML={{ __html: endpoint.urlSubject }}></h3>
                                </a>
                            </span>
                            <span className="endpoint-second-row">
                                from {endpoint.instanceId} {
                                    endpoint.deprecated && typeof endpoint.deprecated === "string" ?
                                        // @ts-ignore
                                        <span>| <span className="deprecated-description">Note:</span> <span className="deprecated-note" dangerouslySetInnerHTML={{ __html: this.getDeprecatedHtml(endpoint.deprecated) }} ></span></span>
                                        : ""
                                }
                                {endpoint.cUrl ?
                                    <span>
                                        <button className="action copy-as-curl btn-copy">
                                            <input type="text" className="curl-data" value={endpoint.cUrl} hidden /> Copy as cUrl <span className="glyphicon glyphicon-copy"></span>
                                        </button>
                                        <div className="clearfix" />
                                    </span>
                                    : ""}
                            </span>
                        </span>

                        <table className="table table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Request body</th>
                                    <th>Required permissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {/* Subject */}
                                    <td>{endpoint.subject}</td>
                                    {/* Request body */}
                                    <td className={"request-schema" + " " + endpoint.serviceName + " " + endpoint.requestSchema + " " + (endpoint.requestSchema ? " " : "deactivated")}>
                                        <a href="" className={endpoint.requestSchema ? "" : "deactivated"}>{endpoint.requestSchema || <span className="not-available">n/a</span>} {endpoint.requestSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}</a>
                                    </td>
                                    {/* Required permissions */}
                                    <td>{endpoint.permissions ? this.forEach(endpoint.permissions, (permissions) => {
                                        return <span className="permission-group">
                                            {permissions instanceof Array ? this.forEach(permissions, (permission) => { return <span className="permission">{permission}</span> }) : <span className="permission">{permissions}</span>}</span>
                                    }) : <span className="permission-group"><span className="permission">none</span></span>}</td>
                                </tr>
                            </tbody>
                            <thead>
                                <tr>
                                    <th>Url</th>
                                    <th>Response body</th>
                                    <th>Must be logged in</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {/* Url */}
                                    <td>{type === "http" ? config.apiRoot + parsedSubject.url : <span className="not-available">n/a</span>}</td>

                                    {/* Response body */}
                                    <td className={"response-schema" + " " + endpoint.serviceName + " " + endpoint.responseSchema + " " + (endpoint.responseSchema ? " " : "deactivated")}>
                                        <a href="" className={endpoint.responseSchema ? "" : "deactivated"} >{endpoint.responseSchema || <span className="not-available">n/a</span>} {endpoint.responseSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}</a>
                                    </td>

                                    {/* Must be logged in */}
                                    <td className={(endpoint.permissions && endpoint.permissions.length > 0) ? true.toString() : endpoint.mustBeLoggedIn.toString()}>
                                        {(endpoint.permissions && endpoint.permissions.length > 0) ? true.toString() : endpoint.mustBeLoggedIn.toString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="table table">
                            <thead>
                                <tr>
                                    <th>Documentation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="description">
                                        {endpoint.docs ?
                                            <div>
                                                {endpoint.docs.description ? <div className="doc-entry-title">Description</div> : ""}
                                                {endpoint.docs.description ? <span className="description-value"> {endpoint.docs.description}</span> : <span className="not-available">n/a</span>}
                                                {endpoint.docs.params ? this.getDocEntry(endpoint.docs.params, "Url parameters") : ""}
                                                {endpoint.docs.query ? this.getDocEntry(endpoint.docs.query, "Query parameters") : ""}
                                                {endpoint.docs.errors ? this.getDocEntry(endpoint.docs.errors, "Errors") : ""}
                                            </div> : <span className="not-available">n/a</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                })}
            </div>
        })
    }

    /**
     * Renders documentation entry.
     * 
     * @param {Object|Array} input 
     * @param {String} title 
     */
    getDocEntry(input, title) {
        if (Object.keys(input).length > 0) {
            return <div>
                <div className="doc-entry-title">{title}</div>
                {this.forEach(input, (value, key) => {
                    return <span>
                        <div className="description-item"><span className="description-key">{key}</span>: <span className="description-value">{value}</span></div>
                    </span>
                })}
            </div>
        }
    }

    /**
     * Loops through an object or array.
     * 
     * @param {Object|Array} toLoop 
     * @param {Function} handler 
     */
    forEach(toLoop, handler) {
        if (!toLoop || Object.keys(toLoop).length === 0)
            return `No endpoints`;

        return Object.keys(toLoop)
            .sort()
            .map(index => {
                return handler(toLoop[index], index);
            });
    }

    /**
     * Adds colors to selected words, defined in the config.
     * 
     * @param {String} string 
     */
    getColorCodedTitle(string) {
        const colorCodedWords = Object.keys(config.colorCodedWords);

        for (let i = 0; i < colorCodedWords.length; i++) {
            string = utils.replaceAll(string, colorCodedWords[i],
                `<span class="${config.colorCodedWords[colorCodedWords[i]]}">${colorCodedWords[i]}</span>`);
        }

        return string;
    }


    /**
     * Adds links to endpoints referenced in the deprecated text.
     * 
     * @param {String} description 
     */
    getDeprecatedHtml(description) {
        const parts = description.split(" ");
        const partsWithEndpoint = {};
        let endpoint = "";
        let endpointsExists = false;

        for (let i = 0; i < parts.length; i++) {
            let partToCompare = parts[i];
            let partHasDot = false;

            if (partToCompare[partToCompare.length - 1] === ".") {
                partToCompare = partToCompare.substring(0, partToCompare.length - 1);
                partHasDot = true;
            }

            if (this.props.allEndpoints[partToCompare]) {
                endpointsExists = true;
                parts[i] = partToCompare;

                partsWithEndpoint[parts[i]] = parts[i];

                if (partHasDot)
                    parts.splice(i + 1, 0, ".");
            }
        }

        if (!endpointsExists)
            return description;

        Object.keys(partsWithEndpoint).
            forEach(key => {
                if (key.includes("http")) {
                    const parsedHttpEndpoint = utils.parseSubjectToAPIUrl(key);
                    partsWithEndpoint[key] = `
                    <a href="#${parsedHttpEndpoint.method}-to-${parsedHttpEndpoint.url}">
                    <span class="${parsedHttpEndpoint.method}">${parsedHttpEndpoint.method}</span>
                     to ${parsedHttpEndpoint.url}
                    </a>`;

                } else
                    partsWithEndpoint[key] = `<a href="#${key}">${this.getColorCodedTitle(key)}</a>`;
            });

        const output = [];

        parts.forEach(pt => {
            if (partsWithEndpoint[pt])
                output.push(partsWithEndpoint[pt]);
            else
                output.push(pt);
        });

        return `<span>${output.join(" ")}</span>`;
    }

}