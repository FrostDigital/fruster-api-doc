import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import { ApiDocContext } from "../../Context";

export default class EndpointsTableOfContentsComponent extends React.Component {

	render() {
		return (
			<ApiDocContext.Consumer>
				{context => (

					<div
						title={this.props.type + " endpoints"}
						className="col-md-6 endpoints">

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
		const elems = ViewUtils
			.sortedForEach(context.endpointsByType.http, (endpoints, serviceName) => {
				endpoints = endpoints.filter(e => !e.hidden);
				endpoints = endpoints.sort(this.sortEndpoints);

				if (endpoints.length === 0)
					return;

				const hasDocumentation = this.findServiceDocs(endpoints, serviceName);

				return (
					<span
						key={`endpointsByType.http-${serviceName}`}>
						<a href={"#" + serviceName + "-http"}>
							<h4>{serviceName}</h4>
						</a>

						<ul
							className="http"
							title={`${serviceName} endpoints`}>

							{
								hasDocumentation &&
								<li>
									<a href={"#" + serviceName + "-" + this.props.type.toLowerCase() + "-documentation"}>
										Documentation
									</a>
								</li>
							}

							{
								endpoints
									.filter(endpoint => !endpoint.hidden)
									.map((endpoint, i) => {
										const parsedSubject = ViewUtils.parseSubjectToAPIUrl(endpoint.subject);

										return (
											<li
												key={`table-of-contents-http-${serviceName}-${endpoint.subject}-${endpoint.instanceId}`}
												title={endpoint.docs ? endpoint.docs.description : ""}
												className={`
                                                ${endpoint.deprecated ? "deprecated" : ""}
                                                ${endpoint.pending ? "pending" : ""}
                                            `}>
												<a href={"#" + parsedSubject.method + "-to-" + parsedSubject.url}>
													<span className={parsedSubject.method}>
														{parsedSubject.method}
													</span> to <span dangerouslySetInnerHTML={{ __html: ViewUtils.getStyledUrlParamUrl(parsedSubject.url) }} />
												</a>
											</li>
										)
									})
							}
						</ul>

					</span>
				)
			})
			// @ts-ignore
			.filter(elem => !!elem);

		return (
			<React.Fragment>

				<a href="#http-endpoints">
					<h3>Http endpoints</h3>
				</a>

				{elems.length > 0 ? elems : this.getNoEndpointsText()}

			</React.Fragment>
		);
	}

	otherEndpoints(context) {
		const elems = ViewUtils
			.sortedForEach(context.endpointsByType[this.props.type.toLowerCase()], (endpoints, serviceName, index) => {
				endpoints = endpoints.filter(e => !e.hidden);
				endpoints = endpoints.sort(this.sortEndpoints);

				if (endpoints.length === 0)
					return;

				if (serviceName === ":userId")
					serviceName = "out";

				const hasDocumentation = this.findServiceDocs(endpoints, serviceName);

				return (
					<span
						key={`${this.props.type.toLowerCase()}-${serviceName}`}>
						<a href={"#" + serviceName + "-" + this.props.type.toLowerCase()}>
							<h4>{serviceName}</h4>
						</a>

						<ul
							title={`${serviceName} endpoints`}
							className={this.props.type.toLowerCase()}>

							{
								hasDocumentation &&
								<li>
									<a href={"#" + serviceName + "-" + this.props.type.toLowerCase() + "-documentation"}>
										Documentation
									</a>
								</li>
							}

							{
								endpoints
									.filter(endpoint => !endpoint.hidden)
									.map((endpoint, i) => {
										return (
											<li key={`table-of-contents-${this.props.type}-${serviceName}-${endpoint.subject}-${endpoint.instanceId}`}
												title={endpoint.docs ? endpoint.docs.description : ""}
												className={`
                                                ${endpoint.deprecated ? "deprecated" : ""}
                                                ${endpoint.pending ? "pending" : ""}
                                            `}>
												<a
													href={"#" + endpoint.subject}
													dangerouslySetInnerHTML={{ __html: ViewUtils.getColorCodedTitle(ViewUtils.getStyledUrlParamUrl(endpoint.subject, ".")) }} />
											</li>
										)
									})
							}
						</ul>
					</span>
				)
			})
			// @ts-ignore
			.filter(elem => !!elem);

		return (
			<React.Fragment>
				<a href={"#" + this.props.type.toLowerCase() + "-endpoints"}>
					<h3>{this.props.type} endpoints</h3>
				</a>

				{elems.length > 0 ? elems : this.getNoEndpointsText()}

			</React.Fragment>
		);
	}

	getNoEndpointsText() {
		return <React.Fragment>No endpoints</React.Fragment>;
	}

	sortEndpoints(a, b) {
		const aU = a.subject.toUpperCase();
		const bU = b.subject.toUpperCase();

		if (aU > bU) return 1;
		else if (aU < bU) return -1;
		else return 0;
	}

	findServiceDocs(endpoints, serviceName) {
		const endpointWithServiceDocs = endpoints.find(e => !!e.serviceDocs && e.serviceDocs.label === serviceName);

		if (!!endpointWithServiceDocs)
			return true;
		else
			return false;
	}

}
