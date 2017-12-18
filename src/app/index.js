import React, { Component, PropTypes } from "react";
const constants = require("../constants");
const utils = require("../utils/utils");


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

                    <a href="#"><h1>API</h1></a>

                    <h4>Table of contents</h4>
                    <div className="row">
                        <div className="col-md-6">
                            <ul className="http">
                                {forEach(this.props.endpointsByType.http, (endpoints, serviceName) => {
                                    return forEach(endpoints, (endpoint) => {
                                        const parsedSubject = utils.parseSubjectToAPIUrl(endpoint.subject);
                                        return <li><a href={"#" + parsedSubject.method + "-to-" + parsedSubject.url}><span className={parsedSubject.method}>{parsedSubject.method}</span> to {parsedSubject.url}</a></li>
                                    });
                                })}
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <ul className="service">
                                {forEach(this.props.endpointsByType.service, (endpoints, serviceName) => {
                                    return forEach(endpoints, (endpoint) => {
                                        return <li><a href={"#" + endpoint.subject}>{endpoint.subject}</a></li>
                                    });
                                })}
                            </ul>
                        </div>
                    </div>

                    <div className="clearfix"></div>

                    <a href="#http-endpoints"><h1 id="http-endpoints">Http endpoints</h1></a>
                    {listEndpointDetails(this.props.endpointsByType.http, "http")}

                    <a href="#service-endpoints"><h1 id="service-endpoints">Service endpoints</h1></a>
                    {listEndpointDetails(this.props.endpointsByType.service)}

                    <br />

                    <div id="modal" className="modal fade bd-example-modal-lg" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <span className="glyphicon glyphicon-remove close" id="close-btn"></span>
                                <h1 id="header"></h1>

                                <h2>Json schema</h2>
                                <div id="json-schema"></div>
                                <button id="copy-json-schema-json">Toggle raw json</button>
                                <textarea hidden id="json-schema-json"></textarea>

                                <h2>Sample</h2>
                                <div id="json-sample"></div>
                                <button id="copy-sample-json">Toggle raw json</button>
                                <textarea hidden id="sample-json"></textarea>
                            </div>
                        </div>
                    </div>

                </div>
            </span>
        );
    }
}

function listEndpointDetails(endpointsJson, type) {
    return forEach(endpointsJson, (endpoints, serviceName) => {
        return <div className={"service-container " + serviceName}>
            <a href={"#" + serviceName}><h2 id={serviceName}>{serviceName}</h2></a>

            {forEach(endpoints, endpoint => {
                const parsedSubject = utils.parseSubjectToAPIUrl(endpoint.subject);

                return <div className="container">
                    {type === "http"
                        ? <span><a href={"#" + parsedSubject.method + "-to-" + parsedSubject.url}><h3 id={parsedSubject.method + "-to-" + parsedSubject.url}>
                            <span className={parsedSubject.method}>{parsedSubject.method}</span> to {parsedSubject.url}</h3></a>from {endpoint.instanceId}</span>
                        : <span> <a href={"#" + endpoint.subject}><h3 id={endpoint.subject}>{endpoint.subject}</h3></a> from {endpoint.instanceId}</span>}

                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Must be logged in</th>
                                <th>Required permissions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{endpoint.subject}</td>
                                <td className={endpoint.mustBeLoggedIn.toString()}>{endpoint.mustBeLoggedIn.toString()}</td>
                                <td>{endpoint.permissions || "none"}</td>
                            </tr>
                        </tbody>
                        <thead>
                            <tr>
                                <th>Request body</th>
                                <th>Response body</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={"request-schema" + " " + endpoint.serviceName + " " + endpoint.requestSchema + " " + (endpoint.requestSchema ? " " : "deactivated")}>
                                    <a href="" className={endpoint.requestSchema ? "" : "deactivated"}>{endpoint.requestSchema || "n/a"} {endpoint.requestSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}</a>
                                </td>
                                <td className={"response-schema" + " " + endpoint.serviceName + " " + endpoint.responseSchema + " " + (endpoint.responseSchema ? " " : "deactivated")}>
                                    <a href="" className={endpoint.responseSchema ? "" : "deactivated"} >{endpoint.responseSchema || "n/a"} {endpoint.responseSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}</a>
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="table table-hover">
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

function forEach(toLoop, handler) {
    return Object.keys(toLoop)
        .sort()
        .map(index => {
            return handler(toLoop[index], index);
        });
}