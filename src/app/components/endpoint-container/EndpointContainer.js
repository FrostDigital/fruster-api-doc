import React from "react";
import EndpointDetailsComponent from "../endpoint-details/EndpointDetailsComponent";
import markdown from "markdown";

export default class EndpointContainer extends React.Component {

	state = {
		checked: true,
		checkboxes: EndpointContainer.prepareCheckboxes(this.props.endpoints),
		isOpen: false,
		selected: false,
		lastHash: null
	};

	static prepareCheckboxes(endpoints) {
		const returnObj = {};

		endpoints.forEach(endpoint => returnObj[endpoint.subject] = true);

		return returnObj;
	}

	// TODO: this should be handled once and not for all places where it's needed!
	componentDidMount() {
		window.addEventListener("hashchange", () => this.reactToHashChange(), false);
		setTimeout(() => this.reactToHashChange());
	}

	componentWillUnmount() {
		window.removeEventListener("hashchange", () => this.reactToHashChange(), false);
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

	async reactToHashChange() {
		const { serviceName, type } = this.props;
		const decodedURI = decodeURI(window.location.hash);
		const decodedURIWithoutHash = decodedURI.replace("#", "");
		const hash = serviceName + "-" + (type || "service") + "-documentation";
		const { isOpen, lastHash } = this.state;
		const serviceDocs = this.findServiceDocs(serviceName);

		let serviceDocsLabel;

		if (serviceDocs)
			serviceDocsLabel = serviceDocs.label;

		if (!serviceDocs || !serviceDocsLabel) {
			this.setState({ lastHash: null });
			return;
		}

		if (!(isOpen
			|| lastHash == decodedURI
			|| !decodedURIWithoutHash.includes(hash))
		)
			switch (true) {
				case decodedURI === `#${hash}`:
					this.reactToClickHash();
			}

		this.setState({ lastHash: decodedURI });
	}

	reactToClickHash() {
		this.setState({
			selected: true,
			isOpen: true
		});

		setTimeout(() => this.setState({ selected: false }), 100);

		if (this.markdownAnchor)
			this.markdownAnchor.scrollIntoView(true);
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

	toggleFoldedServiceDocs() {
		const { isOpen } = this.state;

		if (isOpen)
			history.pushState("", document.title, window.location.pathname);

		this.setState({ isOpen: !isOpen, lastHash: null });
	}

	findServiceDocs(serviceName) {
		const { endpoints } = this.props;
		const endpointWithServiceDocs = endpoints.find(e => !!e.serviceDocs && e.serviceDocs.label === serviceName);

		console.log({ serviceName, endpointWithServiceDocs });

		if (!!endpointWithServiceDocs)
			return endpointWithServiceDocs.serviceDocs;
		else
			return;
	}

	onCheckboxChecked = (e) => {
		this.setState({ checkboxes: { ...this.state.checkboxes, [e.target.name]: e.target.checked }, checked: false });
	}

	render() {
		let { serviceName, type } = this.props;

		const isWsUserIdEndpoint = serviceName === ":userId";

		if (isWsUserIdEndpoint)
			serviceName = "out";

		const serviceDocs = this.findServiceDocs(serviceName);
		let serviceDocsMarkdown;

		console.log(serviceDocs);

		if (serviceDocs)
			serviceDocsMarkdown = serviceDocs.markdown;

		const { isOpen } = this.state;

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
					<span
						className="service-btn"
						style={{
							marginTop: serviceDocsMarkdown ? "-30px" : ""
						}}
					>
						<label
							htmlFor={serviceName + "-" + (type || "service") + "-" + "select-all"}>
							Select / deselect all
                        </label> <input
							id={serviceName + "-" + (type || "service") + "-" + "select-all"}
							onChange={e => this.checkAll()}
							checked={this.state.checked}
							type="checkbox" /> |

                        <a href={`/service-client/${serviceName}?subjects=${encodeURIComponent(this.getCheckedEndpoints())}`}>
							<button className="action">Download service client <span className="glyphicon glyphicon-download"></span></button>
						</a>
					</span>
				}

				<div
					hidden={!serviceDocsMarkdown}
					style={{
						paddingBottom: "10px" // TODO: make new css class out of this
					}}
					className={`
							container endpoint-container
							${this.state.selected ? "selected-animated" : ""}
						`}>

					{
						serviceDocsMarkdown &&
						<React.Fragment>
							<span
								id={serviceName + "-" + (type || "service") + "-documentation"}
								className={`endpoint-fold-btn ${this.state.isOpen ? "open" : ""}`}
								onClick={() => this.toggleFoldedServiceDocs()}
								ref={ref => this.markdownAnchor = ref}
							>

								{this.state.isOpen ?
									<i className="toggle-fold-btn glyphicon glyphicon-menu-down"></i>
									: <i className="toggle-fold-btn glyphicon glyphicon-menu-right"></i>}

							</span>

							<a
								href={"#" + serviceName + "-" + (type || "service") + "-documentation"}
								onClick={() => this.reactToClickHash()}
							>

								<h3 style={{ display: "inline-block" }}>
									Documentation
								</h3>

							</a>
						</React.Fragment>
					}

					{
						isOpen && serviceDocsMarkdown &&
						<div
							dangerouslySetInnerHTML={{
								// @ts-ignore
								__html: markdown.markdown.toHTML(serviceDocsMarkdown)
							}} />
					}

				</div>

				{this.getEndpoints()}

			</div>
		);
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
