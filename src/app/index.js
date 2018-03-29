import React, { Component } from "react";
import constants from "../constants";
import SharedUtils from "../utils/SharedUtils";
import config from "../../config";

import ToolbarComponent from "./components/toolbar/ToolbarComponent";
import EndpointDetailsComponent from "./components/endpoint-details/EndpointDetailsComponent";
import EndpointContainer from "./components/endpoint-container/EndpointContainer";


require("babel-core/register");
require("babel-polyfill");

export default class App extends Component {

    render() {
        return (
            <span>

                <ToolbarComponent />

                <div className="container">
                    <div className="alert alert-danger" id="try-again-warning" hidden>
                        <strong>Note:</strong> Something went wrong or there are no endpoints registered; <a id="refresh-page" href="#">please refresh the page.</a>
                    </div>

                    {this.props.schemasWithErrors
                        ? <div className="alert alert-danger" id="schemas-contains-errors">
                            <strong>Note:</strong>Errors were detected in the following json schemas:
                        {
                                this.forEach(this.props.schemasWithErrors, (schemas, serviceName) => {

                                    return this.forEach(schemas, (schemaWithError) => {

                                        return (
                                            <li className={"request-schema" + " " + serviceName + " " + schemaWithError}>
                                                <a href="" >{schemaWithError} <span className="glyphicon glyphicon-new-window"></span></a> from {serviceName}
                                            </li>
                                        );
                                    })
                                })
                            }
                        </div>
                        : ""}

                    <a href="#"><h1>{config.projectName ? config.projectName + " " : ""}API</h1></a>

                    <h4>Table of contents</h4>

                    <div className="row table-of-contents">
                        <div className="col-md-6">
                            <ul className="http">
                                <a href="#http-endpoints"><h3>Http endpoints</h3></a>
                                {this.forEach(this.props.endpointsByType.http, (endpoints, serviceName) => {
                                    return (
                                        <span>
                                            <a href={"#" + serviceName + "-http"}><h4>{serviceName}</h4></a>

                                            {this.forEach(endpoints, (endpoint) => {
                                                const parsedSubject = SharedUtils.parseSubjectToAPIUrl(endpoint.subject);

                                                return (
                                                    <li className={endpoint.deprecated ? "deprecated" : ""}>
                                                        <a href={"#" + parsedSubject.method + "-to-" + parsedSubject.url}>
                                                            <span className={parsedSubject.method}>{parsedSubject.method}
                                                            </span> to {parsedSubject.url}
                                                        </a>
                                                    </li>
                                                )
                                            })}

                                        </span>
                                    );
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
        return (
            <div className="col-md-6">
                <ul className={type.toLowerCase()}>
                    <a href={"#" + type.toLowerCase() + "-endpoints"}><h3>{type} endpoints</h3></a>

                    {this.forEach(this.props.endpointsByType[type.toLowerCase()], (endpoints, serviceName) => {
                        endpoints = endpoints.sort();

                        return (
                            <span>
                                <a href={"#" + serviceName + "-" + type.toLowerCase()}><h4>{serviceName}</h4></a>
                                {
                                    endpoints.map(endpoint => {
                                        return (
                                            <li className={endpoint.deprecated ? "deprecated" : ""}>
                                                <a dangerouslySetInnerHTML={{ __html: SharedUtils.getColorCodedTitle(endpoint.subject) }} href={"#" + endpoint.subject}></a>
                                            </li>
                                        )
                                    })
                                }
                            </span>
                        )
                    })}
                </ul>
            </div>
        );
    }

    /**
     * Renders the details for an endpoint.
     * 
     * @param {Object} endpointsJson 
     * @param {String=} type 
     */
    listEndpointDetails(endpointsJson, type) {
        return this.forEach(endpointsJson, (endpoints, serviceName) => {
            return <EndpointContainer
                serviceName={serviceName}
                type={type}
                endpoints={endpoints}
                allEndpoints={this.props.allEndpoints} />;
        })
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

}