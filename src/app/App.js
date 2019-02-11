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
            endpointsByType: this.props.endpointsByType,
            isFilteredResult: false,
            filter: (e) => {
                return this.filter(e);
            },
            changeFilterType: (e) => {
                return this.changeFilterType(e);
            },
            filterBy: "subject"
        };
    }

    // shouldComponentUpdate() {
    //     return false;
    // }

    changeFilterType(e) {
        this.setState({ filterBy: e.target.value });
    }

    filter(e) {
        // TODO: debounce
        const value = new String(e.target.value).toLowerCase().split("/").join(".");
        const valueArray = value.split(" ");
        const that = this;

        const service = this.state.filterBy === "subject" ? filterBySubject("service") : filterByPermissions("service");
        const http = this.state.filterBy === "subject" ? filterBySubject("http") : filterByPermissions("http");
        const ws = this.state.filterBy === "subject" ? filterBySubject("ws") : filterByPermissions("ws");

        this.setState({ endpointsByType: { service, http, ws }, isFilteredResult: value !== "" });

        function filterBySubject(type) {
            const foundEndpoints = {};

            Object
                .keys(that.state.backupEndpointsByType[type])
                .forEach(serviceName => {
                    const endpoints = that.state.backupEndpointsByType[type][serviceName];

                    foundEndpoints[serviceName] = endpoints.filter(endpoint => {
                        let containsSearchWord = true;

                        valueArray.forEach(value => {
                            if (value !== "")
                                containsSearchWord = containsSearchWord && endpoint.subject.includes(value);
                        });

                        return containsSearchWord;
                    });
                });

            return foundEndpoints;
        }

        function filterByPermissions(type) {
            const foundEndpoints = {};

            Object
                .keys(that.state.backupEndpointsByType[type])
                .forEach(serviceName => {
                    const endpoints = that.state.backupEndpointsByType[type][serviceName];

                    foundEndpoints[serviceName] = endpoints.filter(endpoint => {
                        if (!endpoint.permissions) return false;

                        let containsSearchWord = false;

                        endpoint.permissions.forEach(permission => {
                            valueArray.forEach(value => {
                                if (value !== "") {
                                    if (permission.includes(value))
                                        containsSearchWord = true;
                                }
                            });
                        });

                        return containsSearchWord;
                    });
                });

            return foundEndpoints;
        }
    }

    render() {
        return (
            <ApiDocContext.Provider
                value={this.state}>

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

                        {this.state.isFilteredResult && <h5 style={{ marginLeft: "15px", color: "#ff6969" }}><b>Note:</b> <i>Showing filtered result</i></h5>}

                        <EndpointsTableOfContentsComponent type="Http" />
                        <EndpointsTableOfContentsComponent type="Service" />
                        <EndpointsTableOfContentsComponent type="Ws" />

                    </div>

                    <div className="clearfix" />

                    {/* {this.state.isFilteredResult ? this.hasEndpoints("http") : true && */}
                    <span>
                        <a href="#http-endpoints">
                            <h1 id="http-endpoints">Http endpoints</h1>
                        </a>
                        {this.listEndpointDetails("http")}
                    </span>


                    {/* {this.state.isFilteredResult ? this.hasEndpoints("ws") : true && */}
                    <span>
                        <a href="#ws-endpoints">
                            <h1 id="ws-endpoints">Ws endpoints</h1>
                        </a>
                        {this.listEndpointDetails("ws")}
                    </span>


                    {/* {this.state.isFilteredResult ? this.hasEndpoints("service") : true && */}
                    <span>
                        <a href="#service-endpoints">
                            <h1 id="service-endpoints">Service endpoints</h1>
                        </a>
                        {this.listEndpointDetails("service")}
                    </span>

                </div>

                <br />

                <ToolbarComponent />

            </ApiDocContext.Provider>
        );
    }

    hasEndpoints(type) {
        const endpoints = this.state.endpointsByType[type];

        console.log({
            endpoints,
            length: Object.keys(endpoints)
        });

        if (Object.keys(endpoints).some(key => endpoints[key].length > 0))
            return true;
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
                if (endpoints.length === 0)
                    return;

                return (
                    <EndpointContainer
                        key={`listEndpointDetails-${serviceName}`}
                        serviceName={serviceName}
                        type={type}
                        endpoints={endpoints}
                        allEndpoints={this.props.allEndpoints} />
                );
            })
    }


}