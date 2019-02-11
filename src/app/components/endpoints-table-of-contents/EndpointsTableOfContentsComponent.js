import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import { ApiDocContext } from "../../Context";

export default class EndpointsTableOfContentsComponent extends React.Component {

    render() {
        return (
            <ApiDocContext.Consumer>
                {context => (

                    <div className="col-md-6">

                        {this.props.type === "Http"
                            ? this.httpEndpoints(context)
                            : this.otherEndpoints(context)}

                    </div>

                )}
            </ApiDocContext.Consumer>
        );
    }

    shouldComponentUpdate() {
        return false;
    }

    httpEndpoints(context) {
        return (
            <ul className="http">

                <a href="#http-endpoints">
                    <h3>Http endpoints</h3>
                </a>

                {
                    Object.keys(context.endpointsByType.http).length === 0

                        ? "No endpoints"

                        : ViewUtils.sortedForEach(context.endpointsByType.http, (endpoints, serviceName, index) => {
                            endpoints = endpoints.sort(this.sortEndpoints);

                            if (endpoints.length === 0)
                                return;

                            return (
                                <span
                                    key={`endpointsByType.http-${serviceName}`}>
                                    <a href={"#" + serviceName + "-http"}>
                                        <h4>{serviceName}</h4>
                                    </a>
                                    {
                                        endpoints.map((endpoint, index) => {
                                            const parsedSubject = ViewUtils.parseSubjectToAPIUrl(endpoint.subject);

                                            return (
                                                <li
                                                    key={`table-of-contents-http-${serviceName}-${endpoint.subject}`}
                                                    title={endpoint.docs ? endpoint.docs.description : ""}
                                                    className={endpoint.deprecated ? "deprecated" : ""}>
                                                    <a href={"#" + parsedSubject.method + "-to-" + parsedSubject.url}>
                                                        <span className={parsedSubject.method}>
                                                            {parsedSubject.method}
                                                        </span> to {parsedSubject.url}
                                                    </a>
                                                </li>
                                            )
                                        })
                                    }

                                </span>
                            )
                        })
                }

            </ul>
        );
    }

    otherEndpoints(context) {
        return (
            <ul className={this.props.type.toLowerCase()}>
                <a href={"#" + this.props.type.toLowerCase() + "-endpoints"}>
                    <h3>{this.props.type} endpoints</h3>
                </a>

                {
                    Object.keys(context.endpointsByType[this.props.type.toLowerCase()]).length === 0

                        ? "No endpoints"

                        : ViewUtils.sortedForEach(context.endpointsByType[this.props.type.toLowerCase()], (endpoints, serviceName, index) => {
                            endpoints = endpoints.sort(this.sortEndpoints);

                            if (endpoints.length === 0)
                                return;

                            return (
                                <span
                                    key={`${this.props.type.toLowerCase()}-${serviceName}`}>
                                    <a href={"#" + serviceName + "-" + this.props.type.toLowerCase()}>
                                        <h4>{serviceName}</h4>
                                    </a>
                                    {
                                        endpoints.map((endpoint, index) => {
                                            return (
                                                <li key={`table-of-contents-${this.props.type}-${serviceName}-${endpoint.subject}`}
                                                    title={endpoint.docs ? endpoint.docs.description : ""}
                                                    className={endpoint.deprecated ? "deprecated" : ""}>
                                                    <a
                                                        href={"#" + endpoint.subject}
                                                        dangerouslySetInnerHTML={{ __html: ViewUtils.getColorCodedTitle(endpoint.subject) }} />
                                                </li>
                                            )
                                        })
                                    }
                                </span>
                            )
                        })
                }

            </ul>
        );
    }

    sortEndpoints(a, b) {
        const aU = a.subject.toUpperCase();
        const bU = b.subject.toUpperCase();

        if (aU > bU) return 1;
        else if (aU < bU) return -1;
        else return 0;
    }

}