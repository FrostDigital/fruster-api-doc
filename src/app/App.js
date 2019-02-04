import "babel-core/register";
import "babel-polyfill";
import React from "react";
import ViewUtils from "../utils/ViewUtils";
import EndpointContainer from "./components/endpoint-container/EndpointContainer";
import EndpointsTableOfContentsComponent from "./components/endpoints-table-of-contents/EndpointsTableOfContentsComponent";
import ErrorMessageComponent from "./components/error-message/ErrorMessageComponent";
import ToolbarComponent from "./components/toolbar/ToolbarComponent";
import { ApiDocContext } from "./Context";


export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.numberOfEndpoints = Object.keys(this.props.endpointsByType.http).length
            + Object.keys(this.props.endpointsByType.service).length
            + Object.keys(this.props.endpointsByType.ws).length;

        this.state = {
            config: this.props.config,
            backupEndpointsByType: this.props.endpointsByType,
            endpointsByType: this.props.endpointsByType
        };
    }

    // shouldComponentUpdate() {
    //     return false;
    // }

    filter(e) {
        // TODO: debounce
        const value = new String(e.target.value).toLowerCase();

        const service = {};
        const http = {};
        const ws = {};

        Object
            .keys(this.state.backupEndpointsByType.service)
            .forEach(serviceName => {
                const endpoints = this.state.backupEndpointsByType.service[serviceName];
                service[serviceName] = endpoints.filter(endpoint => endpoint.subject.includes(value));
            });

        Object
            .keys(this.state.backupEndpointsByType.http)
            .forEach(httpName => {
                const endpoints = this.state.backupEndpointsByType.http[httpName];
                http[httpName] = endpoints.filter(endpoint => endpoint.subject.includes(value));
            });

        Object
            .keys(this.state.backupEndpointsByType.ws)
            .forEach(wsName => {
                const endpoints = this.state.backupEndpointsByType.ws[wsName];
                ws[wsName] = endpoints.filter(endpoint => endpoint.subject.includes(value));
            });

        /** TODO: Make this update the entire state! */
        this.setState({ endpointsByType: { service, http, ws } });
    }

    render() {
        return (
            <ApiDocContext.Provider
                value={this.state}>

                <input onChange={(e) => this.filter(e)} />

                <div className="container">
                    <ErrorMessageComponent
                        numberOfEndpoints={this.numberOfEndpoints}
                        schemasWithErrors={this.props.schemasWithErrors}
                        schemasPerService={this.props.schemasPerService} />

                    <a href="#">
                        <h1>{this.props.config.projectName ? this.props.config.projectName + " " : ""}API</h1>
                    </a>

                    <h4>Table of contents</h4>

                    <div className="row table-of-contents">

                        <EndpointsTableOfContentsComponent type="Http" />
                        <EndpointsTableOfContentsComponent type="Service" />
                        <EndpointsTableOfContentsComponent type="Ws" />

                    </div>

                    <div className="clearfix" />

                    <a href="#http-endpoints">
                        <h1 id="http-endpoints">Http endpoints</h1>
                    </a>
                    {this.listEndpointDetails("http")}

                    <a href="#ws-endpoints">
                        <h1 id="ws-endpoints">Ws endpoints</h1>
                    </a>
                    {this.listEndpointDetails("ws")}

                    <a href="#service-endpoints">
                        <h1 id="service-endpoints">Service endpoints</h1>
                    </a>
                    {this.listEndpointDetails("service")}

                </div>

                <br />

                <ToolbarComponent />

            </ApiDocContext.Provider>
        );
    }

    /**
     * Renders the details for all endpoints within a category (http, service & ws).
     *
    * @param {String } type
    */
    listEndpointDetails(type) {
        if (Object.keys(this.state.endpointsByType[type]).length === 0)
            return "No endpoints";

        return ViewUtils
            .sortedForEach(this.state.endpointsByType[type], (endpoints, serviceName, index) => {
                return (
                    <EndpointContainer
                        key={"listEndpointDetails" + index}
                        serviceName={serviceName}
                        type={type}
                        endpoints={endpoints}
                        allEndpoints={this.props.allEndpoints} />
                );
            })
    }


}