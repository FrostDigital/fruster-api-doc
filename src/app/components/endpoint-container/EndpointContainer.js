import React from "react";
import EndpointDetailsComponent from "../endpoint-details/EndpointDetailsComponent";

export default class EndpointContainer extends React.Component {

    state = {
        checked: true,
        checkboxes: EndpointContainer.prepareCheckboxes(this.props.endpoints)
    };

    static prepareCheckboxes(endpoints) {
        const returnObj = {};

        endpoints.forEach(endpoint => returnObj[endpoint.subject] = true);

        return returnObj;
    }

    getCheckedEndpoints() {
        const endpointsBySubject = {};

        this.props.endpoints.forEach(e => endpointsBySubject[e.subject] = { hidden: e.hidden });

        return Object.keys(this.state.checkboxes)
            .map(subject => {
                if (this.state.checkboxes[subject] && !endpointsBySubject[subject].hidden)
                    return subject;
            })
            .filter(subject => !!subject)
            .join(",");
    }

    checkAll() {
        const newCheckedStatus = !this.state.checked;
        const checkboxesNewStatus = {};

        Object.keys(this.state.checkboxes).forEach(subject => checkboxesNewStatus[subject] = newCheckedStatus);

        this.setState({
            checked: newCheckedStatus,
            checkboxes: checkboxesNewStatus
        });
    }

    render() {
        let { serviceName } = this.props;

        const isWsUserIdEndpoint = serviceName === ":userId";

        if (isWsUserIdEndpoint)
            serviceName = "out";

        return (
            <div
                id={serviceName + "-" + (this.props.type || "service")}
                className={"service-container " + serviceName + "-"}>

                {
                    // To not break old links to #:userId-ws
                    isWsUserIdEndpoint && <div id=":userId-ws" />
                }
                <a href={"#" + serviceName + "-" + (this.props.type || "service")}><h2>{serviceName}</h2></a>

                {
                    this.props.type === "service" &&
                    <span className="service-btn">
                        <label
                            htmlFor={serviceName + "-" + (this.props.type || "service") + "-" + "select-all"}>
                            Select / deselect all
                        </label> <input
                            id={serviceName + "-" + (this.props.type || "service") + "-" + "select-all"}
                            onChange={e => this.checkAll()}
                            checked={this.state.checked}
                            type="checkbox" /> |

                        <a href={`/service-client/${serviceName}?subjects=${encodeURIComponent(this.getCheckedEndpoints())}`}>
                            <button className="action">Download service client <span className="glyphicon glyphicon-download"></span></button>
                        </a>
                    </span>
                }

                {this.getEndpoints()}

            </div>
        );
    }

    onCheckboxChecked = (e) => {
        this.setState({ checkboxes: { ...this.state.checkboxes, [e.target.name]: e.target.checked }, checked: false });
    }

    /**
     * Prepares all endpoints within this category
     */
    getEndpoints() {
        return this.props.endpoints
            .filter(endpoint => !endpoint.hidden)
            .map(endpoint => {
                const schemas = endpoint.schemas
                    .filter(schema => {
                        if (schema) {
                            switch (true) {
                                case schema.id === endpoint.requestSchema:
                                case schema.id === endpoint.responseSchema:
                                case endpoint.requestSchema && typeof endpoint.requestSchema === "object" && schema.id === endpoint.requestSchema.id:
                                case endpoint.responseSchema && typeof endpoint.responseSchema && schema.id === endpoint.responseSchema.id:
                                    return schema;
                            }
                        }
                    });

                if (endpoint.requestSchema && typeof endpoint.requestSchema === "object") {
                    if (!schemas.find(schema => schema.id === endpoint.requestSchema.id))
                        schemas.push(endpoint.requestSchema);

                    endpoint.requestSchema = endpoint.requestSchema.id;
                }

                if (endpoint.responseSchema && typeof endpoint.responseSchema === "object") {
                    if (!schemas.find(schema => schema.id === endpoint.responseSchema.id))
                        schemas.push(endpoint.responseSchema);

                    endpoint.responseSchema = endpoint.responseSchema.id;
                }

                return (
                    <span key={`endpoint-${endpoint.subject}`}>
                        <hr />
                        <EndpointDetailsComponent
                            type={this.props.type}
                            endpoint={endpoint}
                            schemas={schemas}
                            allEndpoints={this.props.allEndpoints}
                            onCheck={e => this.onCheckboxChecked(e)}
                            checked={this.state.checkboxes[endpoint.subject]}
                        />
                    </span>
                )
            });
    }
}