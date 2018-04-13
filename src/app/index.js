import React from "react";
import constants from "../constants";
import SharedUtils from "../utils/SharedUtils";
import config from "../../config";

import ToolbarComponent from "./components/toolbar/ToolbarComponent";
import EndpointDetailsComponent from "./components/endpoint-details/EndpointDetailsComponent";
import EndpointContainer from "./components/endpoint-container/EndpointContainer";
import ScrollToTopComponent from "./components/scroll-to-top/ScrollToTopComponent";
import JsonSchemaModalComponent from "./components/modal/JsonSchemaModalComponent";
import ErrorMessageComponent from "./components/error-message/ErrorMessageComponent";

require("babel-core/register");
require("babel-polyfill");

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.numberOfEndpoints = Object.keys(this.props.endpointsByType.http).length
            + Object.keys(this.props.endpointsByType.service).length
            + Object.keys(this.props.endpointsByType.ws).length;
    }

    render() {
        return (
            <span>

                <ToolbarComponent />

                <div className="container">
                    <ErrorMessageComponent numberOfEndpoints={this.numberOfEndpoints} schemasWithErrors={this.props.schemasWithErrors} schemasPerService={this.props.schemasPerService} />

                    <a href="#"><h1>{config.projectName ? config.projectName + " " : ""}API</h1></a>

                    <h4>Table of contents</h4>

                    <div className="row table-of-contents">
                        <div className="col-md-6">
                            <ul className="http">
                                <a href="#http-endpoints"><h3>Http endpoints</h3></a>
                                {SharedUtils.forEach(this.props.endpointsByType.http, (endpoints, serviceName) => {
                                    return (
                                        <span>
                                            <a href={"#" + serviceName + "-http"}><h4>{serviceName}</h4></a>

                                            {SharedUtils.forEach(endpoints, (endpoint) => {
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

                <ScrollToTopComponent />

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

                    {SharedUtils.forEach(this.props.endpointsByType[type.toLowerCase()], (endpoints, serviceName) => {
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
* @param {String =} type
        */
    listEndpointDetails(endpointsJson, type) {
        return SharedUtils.forEach(endpointsJson, (endpoints, serviceName) => {
            return <EndpointContainer
                serviceName={serviceName}
                type={type}
                endpoints={endpoints}
                allEndpoints={this.props.allEndpoints} />;
        })
    }


}