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
            resetFilter: () => {
                return this.resetFilter();
            },
            filterResetCallback: undefined,
            filterBy: "subject",
            currentFilter: undefined
        };
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

                        {
                            this.state.isFilteredResult &&
                            <h5 style={{ marginLeft: "15px", color: "#ff6969" }}>
                                <b>Note:</b><i>Showing filtered result by <b>"{this.state.currentFilter}"</b></i>. <a className="clickable" onClick={this.resetFilter}>Reset</a>
                            </h5>
                        }

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

        if (Object.keys(endpoints).some(key => endpoints[key].length > 0))
            return true;
    }

    /**
     * Renders the details for all endpoints within a category (http, service & ws).
     *
    * @param {String } type
    */
    listEndpointDetails(type) {
        if (this.state.endpointsByType[type] && Object.keys(this.state.endpointsByType[type]).length === 0)
            return "No endpoints";

        return ViewUtils
            .sortedForEach(this.state.endpointsByType[type], (endpoints, serviceName, index) => {
                if (endpoints.some(e => !e.hidden))
                    return (
                        <EndpointContainer
                            key={`${serviceName}`}
                            serviceName={serviceName}
                            type={type}
                            endpoints={endpoints}
                            allEndpoints={this.props.allEndpoints} />
                    );
            })
    }

    async changeFilterType(e) {
        e.persist();

        await this.setState({ filterBy: e.target.value });

        this.filter(undefined, this.state.currentFilter || "");
    }

    /**
     * @param {React.SyntheticEvent<?>} e
     * @param {*=} val
     */
    filter(e, val) {
        window.scrollTo(0, 0);

        const value = new String(val !== undefined
            ? val
            // @ts-ignore
            : e.target.value)
            .toLowerCase().split("/").join(".");
        const valueArray = value.split(" ");
        const that = this;

        let service;
        let http;
        let ws;

        switch (this.state.filterBy) {
            case "permissions":
                filterByPermissions("service");
                filterByPermissions("http");
                filterByPermissions("ws");
                break;
            case "docs":
                filterByDocs("service");
                filterByDocs("http");
                filterByDocs("ws");
                break;
            case "subject":
            default:
                filterBySubject("service");
                filterBySubject("http");
                filterBySubject("ws");
                break;
        }

        this.setState({ isFilteredResult: value !== "", currentFilter: value });

        /**
         * @param {String} type 
         */
        function filterBySubject(type) {
            Object
                .keys(that.props.endpointsByType[type])
                .forEach(serviceName => {
                    const endpoints = that.props.endpointsByType[type][serviceName];

                    endpoints.forEach(endpoint => {
                        let containsSearchWord = true;

                        valueArray.forEach(value => {
                            if (value !== "")
                                containsSearchWord = containsSearchWord && endpoint.subject.includes(value);
                        });

                        if (!containsSearchWord)
                            endpoint.hidden = true;
                        else
                            endpoint.hidden = false;
                    });
                });
        }

        /**
         * @param {String} type 
         */
        function filterByPermissions(type) {
            const foundEndpoints = {};

            Object
                .keys(that.props.endpointsByType[type])
                .forEach(serviceName => {
                    const endpoints = that.props.endpointsByType[type][serviceName];

                    endpoints.forEach(endpoint => {
                        let containsSearchWord = false;

                        if (!endpoint.permissions || endpoint.permissions.length === 0) {
                            endpoint.hidden = true;
                            return;
                        }

                        endpoint.permissions.forEach(permission => {
                            valueArray.forEach(value => {
                                if (value !== "")
                                    containsSearchWord = permission.includes(value);
                            });
                        });

                        if (!containsSearchWord)
                            endpoint.hidden = true;
                        else
                            endpoint.hidden = false;
                    });
                });

            return foundEndpoints;
        }

        /**
         * @param {String} type 
         */
        function filterByDocs(type) {
            const foundEndpoints = {};

            Object
                .keys(that.props.endpointsByType[type])
                .forEach(serviceName => {
                    const endpoints = that.props.endpointsByType[type][serviceName];

                    endpoints.forEach(endpoint => {
                        const flatEndpointObj = squishObject(endpoint.docs);

                        let comparisonString = "";

                        if (flatEndpointObj)
                            Object.keys(flatEndpointObj).forEach(key => comparisonString += `${flatEndpointObj[key]}`);

                        for (let inputValue of valueArray) {
                            if (comparisonString.toLowerCase().includes(inputValue.toLowerCase())) {
                                endpoint.hidden = false;
                                return;
                            }
                        }
                        endpoint.hidden = true;
                    });
                });

            return foundEndpoints;
        }

        /**
        * @param {Object} obj 
        *
        * @return {Object}
        */
        function squishObject(obj) {
            if (!obj) return;

            const output = {};

            Object.keys(obj)
                .forEach(key => {
                    if (obj[key] && typeof obj[key] === "object") {
                        const squishedSubObject = squishObject(obj[key]);

                        if (squishedSubObject)
                            Object.keys(squishedSubObject)
                                .forEach(subObjKey => {
                                    output[subObjKey] = squishedSubObject[subObjKey];
                                });
                    } else {
                        output[key] = obj[key];
                    }
                });

            return output;
        }
    }

    resetFilter = () => {
        this.filter(undefined, "");
        this.setState({ isFilteredResult: false, currentFilter: undefined });

        if (this.state.filterResetCallback)
            this.state.filterResetCallback();
    };

}