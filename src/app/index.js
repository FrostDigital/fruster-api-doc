import React, { Component, PropTypes } from "react";
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
                            forEach(this.props.schemasWithErrors, (schemas, serviceName) => {

                                return forEach(schemas, (schemaWithError) => {

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
                                {forEach(this.props.endpointsByType.http, (endpoints, serviceName) => {
                                    return <span>
                                        <a href={"#" + serviceName + "-http"}><h4>{serviceName}</h4></a>
                                        {forEach(endpoints, (endpoint) => {
                                            const parsedSubject = utils.parseSubjectToAPIUrl(endpoint.subject);
                                            return <li className={endpoint.deprecated ? "deprecated" : ""}><a href={"#" + parsedSubject.method + "-to-" + parsedSubject.url}><span className={parsedSubject.method}>{parsedSubject.method}</span> to {parsedSubject.url}</a></li>
                                        })}

                                    </span>
                                })}
                            </ul>
                        </div>

                        {tableOfContents(this, "Service")}
                        {tableOfContents(this, "Ws")}

                    </div>

                    <div className="clearfix"></div>

                    <a href="#http-endpoints"><h1 id="http-endpoints">Http endpoints</h1></a>
                    {listEndpointDetails(this.props.endpointsByType.http, "http")}

                    <a href="#ws-endpoints"><h1 id="ws-endpoints">Ws endpoints</h1></a>
                    {listEndpointDetails(this.props.endpointsByType.ws, "ws")}

                    <a href="#service-endpoints"><h1 id="service-endpoints">Service endpoints</h1></a>
                    {listEndpointDetails(this.props.endpointsByType.service)}

                    <br />

                    <div id="modal" className="modal fade bd-example-modal-lg" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" >
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <span className="glyphicon glyphicon-remove close" id="close-btn"></span>
                                <h1 id="header"></h1>

                                <a href="#schema">
                                    <div>Go to json Schema<span className="glyphicon glyphicon-chevron-right"></span></div>
                                </a>
                                <a href="#sample">
                                    <div>Go to sample<span className="glyphicon glyphicon-chevron-right"></span></div>
                                </a>

                                <h2 id="schema">Json schema</h2>
                                <pre>
                                    <code id="json-schema-json"></code>
                                </pre>

                                <h2 id="sample">Sample</h2>
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
}

function tableOfContents(that, type) {
    return <div className="col-md-6">
        <ul className={type.toLowerCase()}>
            <a href={"#" + type.toLowerCase() + "-endpoints"}><h3>{type} endpoints</h3></a>
            {forEach(that.props.endpointsByType[type.toLowerCase()], (endpoints, serviceName) => {
                return <span>
                    <a href={"#" + serviceName + "-" + type.toLowerCase()}><h4>{serviceName}</h4></a>
                    {forEach(endpoints, (endpoint) => {
                        return <li className={endpoint.deprecated ? "deprecated" : ""}><a dangerouslySetInnerHTML={{ __html: getColorCodedTitle(endpoint.subject) }} href={"#" + endpoint.subject}></a></li>
                    })}
                </span>
            })}
        </ul>
    </div>;
}

function listEndpointDetails(endpointsJson, type) {
    return forEach(endpointsJson, (endpoints, serviceName) => {
        return <div id={serviceName + "-" + (type || "service")} className={"service-container " + serviceName}>
            <a href={"#" + serviceName + "-" + (type || "service")}><h2>{serviceName}</h2></a>

            {forEach(endpoints, endpoint => {
                const parsedSubject = utils.parseSubjectToAPIUrl(endpoint.subject);

                return <div className={(endpoint.deprecated ? "deprecated-container" : "") + " container endpoint-container"}>
                    <span>
                        {
                            type === "http"
                                ?
                                <span>
                                    <a href={"#" + parsedSubject.method + "-to-" + parsedSubject.url}>
                                        <h3 className={endpoint.deprecated ? "deprecated" : ""} id={parsedSubject.method + "-to-" + parsedSubject.url}>
                                            <span className={parsedSubject.method}>{parsedSubject.method}</span> to {parsedSubject.url}
                                        </h3>
                                    </a>
                                </span>

                                :
                                <span>
                                    <a href={"#" + endpoint.subject}>
                                        <h3 className={endpoint.deprecated ? "deprecated" : ""} id={endpoint.subject} dangerouslySetInnerHTML={{ __html: getColorCodedTitle(endpoint.subject) }}></h3>
                                    </a>
                                </span>
                        }

                        from {endpoint.instanceId} {
                            endpoint.deprecated && typeof endpoint.deprecated === "string" ?
                                <span>| <span className="deprecated-description">Note:</span> {endpoint.deprecated} </span>
                                : ""
                        }
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
                                    <a href="" className={endpoint.requestSchema ? "" : "deactivated"}>{endpoint.requestSchema || "n/a"} {endpoint.requestSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}</a>
                                </td>
                                {/* Required permissions */}
                                <td>{endpoint.permissions ? forEach(endpoint.permissions, (permissions) => {
                                    return <span className="permission-group">
                                        {permissions instanceof Array ? forEach(permissions, (permission) => { return <span className="permission">{permission}</span> }) : <span className="permission">{permissions}</span>}</span>
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
                                <td>{type === "http" ? config.apiRoot + parsedSubject.url : "n/a"}</td>

                                {/* Response body */}
                                <td className={"response-schema" + " " + endpoint.serviceName + " " + endpoint.responseSchema + " " + (endpoint.responseSchema ? " " : "deactivated")}>
                                    <a href="" className={endpoint.responseSchema ? "" : "deactivated"} >{endpoint.responseSchema || "n/a"} {endpoint.responseSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}</a>
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
                                        <p>
                                            {endpoint.docs.description ? <div className="doc-entry-title">Description</div> : ""}
                                            {endpoint.docs.description ? <span className="description-value"> {endpoint.docs.description}</span> : "n/a"}
                                            {endpoint.docs.params ? getDocEntry(endpoint.docs.params, "Url parameters") : ""}
                                            {endpoint.docs.query ? getDocEntry(endpoint.docs.query, "Query parameters") : ""}
                                            {endpoint.docs.errors ? getDocEntry(endpoint.docs.errors, "Errors") : ""}
                                        </p> : "n/a"}
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
 * @param {Object|Array} input 
 * @param {String} title 
 */
function getDocEntry(input, title) {
    if (Object.keys(input).length > 0) {
        return <p>
            <div className="doc-entry-title">{title}</div>
            {forEach(input, (value, key) => {
                return <span>
                    <div className="description-item"><span className="description-key">{key}</span>: <span className="description-value">{value}</span></div>
                </span>
            })}
        </p>
    }
}

/**
 * @param {Object|Array} toLoop 
 * @param {Function} handler 
 */
function forEach(toLoop, handler) {
    if (!toLoop || Object.keys(toLoop).length === 0)
        return `No endpoints`;

    return Object.keys(toLoop)
        .sort()
        .map(index => {
            return handler(toLoop[index], index);
        });
}

/**
 * @param {String} string 
 */
function getColorCodedTitle(string) {
    const colorCodedWords = Object.keys(config.colorCodedWords);

    for (let i = 0; i < colorCodedWords.length; i++) {
        string = utils.replaceAll(string, colorCodedWords[i],
            `<span class="${config.colorCodedWords[colorCodedWords[i]]}">${colorCodedWords[i]}</span>`);
    }

    return string;
}