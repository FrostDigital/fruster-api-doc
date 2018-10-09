import React from "react";
import EndpointDetailsComponent from "../endpoint-details/EndpointDetailsComponent";

export default class EndpointContainer extends React.Component {

    render() {
        return (
            <div
                id={this.props.serviceName + "-" + (this.props.type || "service")}
                className={"service-container " + this.props.serviceName + "-"}>

                <a href={"#" + this.props.serviceName + "-" + (this.props.type || "service")}><h2>{this.props.serviceName}</h2></a>

                {
                    this.props.type === "service" ?
                        <a href={"/service-client/" + this.props.serviceName}>
                            <button className="action service-btn">Download service client <span className="glyphicon glyphicon-download"></span></button>
                        </a>
                        : ""
                }

                {this.getEndpoints()}

            </div>
        );
    }

    shouldComponentUpdate() {
        return false;
    }

    /**
     * Prepares all endpoints within this category
     */
    getEndpoints() {
        return this.props.endpoints
            .map((endpoint, index) => {
                const schemas = endpoint.schemas.filter(schema => schema && (schema.id === endpoint.requestSchema || schema.id === endpoint.responseSchema));

                return (
                    <span key={"endpoint" + index}>
                        <hr />
                        <EndpointDetailsComponent
                            type={this.props.type}
                            endpoint={endpoint}
                            schemas={schemas}
                            allEndpoints={this.props.allEndpoints} />
                    </span>
                )
            });
    }
}