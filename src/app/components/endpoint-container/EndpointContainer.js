import React from "react";
import EndpointDetailsComponent from "../endpoint-details/EndpointDetailsComponent";

export default class EndpointContainer extends React.Component {

    render() {
        return (
            <div id={this.props.serviceName + "-" + (this.props.type || "service")} className={"service-container " + this.props.serviceName + "-"}>

                <a href={"#" + this.props.serviceName + "-" + (this.props.type || "service")}><h2>{this.props.serviceName}</h2></a>

                {this.getEndpoints()}
                WAS
            </div>
        );
    }

    getEndpoints() {
        return this.props.endpoints
            .map(endpoint => {
                const schemas = endpoint.schemas.filter(schema => schema.id === endpoint.requestSchema || schema.id === endpoint.responseSchema);

                return (
                    <span>
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