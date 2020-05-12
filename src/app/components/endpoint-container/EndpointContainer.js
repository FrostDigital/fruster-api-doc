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
		let { serviceName, type } = this.props;

		const isWsUserIdEndpoint = serviceName === ":userId";

		if (isWsUserIdEndpoint)
			serviceName = "out";

		const styleTs = {
			backgroundColor: "#1c1f24",
			left: "125px",
			display: "inline-block",
			position: "relative",
			top: "-45px",
			padding: "10px",
			paddingRight: "3px",
			borderRadius: "8px"
		};

		const styleJs = {
			backgroundColor: "#1c1f24",
			left: "67px",
			display: "inline-block",
			position: "relative",
			top: "0px",
			padding: "10px",
			paddingRight: "3px",
			borderRadius: "8px",
		};

		return (
			<div
				id={serviceName + "-" + (type || "service")}
				className={"service-container " + serviceName + "-"}>

				{
					// To not break old links to #:userId-ws
					isWsUserIdEndpoint && <div id=":userId-ws" />
				}
				<a href={"#" + serviceName + "-" + (type || "service")}><h2>{serviceName}</h2></a>

				{
					type === "service" &&
					<span className="service-btn">
						<label
							htmlFor={serviceName + "-" + (type || "service") + "-" + "select-all"}>
							Select / deselect all
                        </label> <input
							id={serviceName + "-" + (type || "service") + "-" + "select-all"}
							onChange={e => this.checkAll()}
							checked={this.state.checked}
							type="checkbox" /> | <a href={`/service-client/${serviceName}/ts?subjects=${encodeURIComponent(this.getCheckedEndpoints())}`}><button className="action"><img src="https://www.typescriptlang.org/assets/images/icons/android-chrome-192x192.png" height="15px" style={{ marginBottom: 3 }} /><span className="glyphicon glyphicon-download" style={{ top: "-7px" }}></span></button></a><a href={`/service-client/${serviceName}/js?subjects=${encodeURIComponent(this.getCheckedEndpoints())}`}><button className="action"><img src="http://seravo.fi/uploads/seravo/2013/06/JavaScript-logo.png" height="15px" style={{ marginBottom: 3 }} /><span className="glyphicon glyphicon-download" style={{ top: "-7px" }}></span></button></a>

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
		const { endpoints, allEndpoints, type } = this.props;

		return endpoints
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
					<React.Fragment key={`endpoint-${endpoint.subject}-${endpoint.instanceId}`}>
						<hr />
						<EndpointDetailsComponent
							type={type}
							endpoint={endpoint}
							schemas={schemas}
							allEndpoints={allEndpoints}
							onCheck={e => this.onCheckboxChecked(e)}
							checked={this.state.checkboxes[endpoint.subject]}
						/>
					</React.Fragment>
				)
			});
	}
}
