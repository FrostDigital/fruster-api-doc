import markdown from "markdown";
import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import { ApiDocContext } from "../../Context";
import JsonSchemaModalComponent from "../modal/JsonSchemaModalComponent";
import CopyAsCurlComponent from "./copy-as-curl/CopyAsCurlComponent";
import CopyToClipboardButtonComponent from "../copy-to-clipboard/CopyToClipboardButtonComponent";

const RESPONSE_BODY = "RESPONSE_BODY";
const REQUEST_BODY = "REQUEST_BODY";

export default class EndpointDetailsComponent extends React.Component {

	state = {
		parsedSubject: this.getParsedSubject(),
		requestSchema: this.props.schemas.find(schema => schema.id === this.props.endpoint.requestSchema),
		responseSchema: this.props.schemas.find(schema => schema.id === this.props.endpoint.responseSchema),
		urlSubjectLink: this.getSubjectLink(),
		urlSubject: this.getSubject(),
		isOpen: false,
		selected: false,
		lastHash: ""
	};

	getParsedSubject() {
		if (this.parsedSubject)
			return this.parsedSubject;

		const parsedSubject = ViewUtils.parseSubjectToAPIUrl(this.props.endpoint.subject);
		this.parsedSubject = parsedSubject;

		return parsedSubject;
	}

	getSubjectLink() {
		const parsedSubject = this.getParsedSubject();

		if (this.props.type === "http")
			return `${parsedSubject.method}-to-${parsedSubject.url}`;
		else
			return this.props.endpoint.subject;
	}

	getSubject() {
		const parsedSubject = this.getParsedSubject();

		if (this.props.type === "http") {
			const parsedSubjectUrl = ViewUtils.getStyledUrlParamUrl(parsedSubject.url);

			return `<span class="${parsedSubject.method}">${parsedSubject.method}</span> to ${parsedSubjectUrl}`;
		} else
			return ViewUtils.getColorCodedTitle(ViewUtils.getStyledUrlParamUrl(this.props.endpoint.subject, "."));
	}

	componentDidMount() {
		window.addEventListener("hashchange", () => this.reactToHashChange(), false);
		setTimeout(() => this.reactToHashChange());
	}

	componentWillUnmount() {
		window.removeEventListener("hashchange", () => this.reactToHashChange(), false);
	}

	async reactToHashChange() {
		const decodedURI = decodeURI(window.location.hash);
		const decodedURIWithoutHash = decodedURI.replace("#", "");
		const parsedSubject = this.getParsedSubject();

		if (this.props.endpoint.hidden
			|| this.state.isOpen
			|| this.state.lastHash == decodedURI
			|| (!decodedURIWithoutHash.includes(this.props.endpoint.subject)
				&& !decodedURIWithoutHash.includes(`${parsedSubject.method}-to-${parsedSubject.url}`))
		)
			return;

		const newHashWithoutTab = decodedURI.substring(0, decodedURI.length - 1);
		const lastHashWithoutTab = this.state.lastHash.substring(0, this.state.lastHash.length - 1);

		switch (true) {
			case decodedURI === `#${this.state.urlSubjectLink}`:
			case decodedURI.includes("?modal=") && decodedURI.includes(`#${this.state.urlSubjectLink}?`):
				/** If hash was just a tab switch we don't do anything */
				if (this.state.requestSchema && decodedURI.includes(`?modal=${this.state.requestSchema.id}`)
					|| this.state.responseSchema && decodedURI.includes(`?modal=${this.state.responseSchema.id}`)) {
					if (newHashWithoutTab === lastHashWithoutTab)
						return;
				}

				this.reactToClickHash();

				if (this.state.requestSchema && decodedURI.includes(`?modal=${this.state.requestSchema.id}`)) {
					if (this.requestBodyModal)
						this.requestBodyModal.openModal();
				} else if (this.state.responseSchema && decodedURI.includes(`?modal=${this.state.responseSchema.id}`)) {
					if (this.responseBodyModal)
						this.responseBodyModal.openModal();
				}
		}

		this.setState({ lastHash: decodedURI });
	}

	reactToClickHash() {
		this.setState({
			selected: true,
			isOpen: true
		});

		setTimeout(() => this.setState({ selected: false }), 100);

		if (this.markup)
			this.markup.scrollIntoView(true);
	}

	render() {
		const {
			endpoint: {
				deprecated,
				pending,
				instanceId,
				cUrl,
				subject,
				docs,
				sourceVersion
			},
			type,
			checked,
			onCheck
		} = this.props;

		return (
			<ApiDocContext.Consumer>
				{context => (
					<React.Fragment>
						<div
							ref={ref => this.markup = ref}
							id={this.state.urlSubjectLink}
							className={`
                                ${deprecated ? "deprecated-container" : ""}
                                ${pending ? "pending-container" : ""}
                                container endpoint-container
                                ${this.state.selected ? "selected-animated" : ""}
                            `}>
							<React.Fragment>
								<React.Fragment>
									<span
										className={`endpoint-fold-btn ${this.state.isOpen ? "open" : ""}`}
										onClick={() => this.toggleFolded()}>
										{this.state.isOpen ?
											<i className="toggle-fold-btn glyphicon glyphicon-menu-down"></i>
											: <i className="toggle-fold-btn glyphicon glyphicon-menu-right"></i>}
									</span>

									<a href={"#" + this.state.urlSubjectLink} onClick={() => this.reactToClickHash()}>
										<h3
											style={{ display: "inline-block" }}
											className={`
                                                ${deprecated ? "deprecated" : ""}
                                                ${pending ? "pending" : ""}
                                            `}>
											<span dangerouslySetInnerHTML={{ __html: this.state.urlSubject }}></span>
										</h3>
									</a>
								</React.Fragment>

								<span className="endpoint-second-row" title={sourceVersion}>
									from {instanceId} {this.getInformationNote()}

									<CopyAsCurlComponent cUrl={cUrl} />

									{type === "service"
										&& <input
											type="checkbox"
											name={subject}
											checked={checked}
											onChange={onCheck}
											style={{ float: "right" }} />}

								</span>

							</React.Fragment>

							{
								this.state.isOpen ?

									<React.Fragment>

										{this.getEndpointDetailsTable(context)}

										{this.getDocumentationTable()}

									</React.Fragment>

									:
									docs
									&& docs.description
									&& <span
										onClick={() => this.toggleFolded()}
										title={docs ? docs.description : ""}
										className="short-description"
										dangerouslySetInnerHTML={{
											// @ts-ignore
											__html: markdown.markdown.toHTML(docs.description)
										}} />
							}

						</div>

						{
							this.state.isOpen &&

							<React.Fragment>

								{this.state.requestSchema &&
									<JsonSchemaModalComponent
										ref={ref => { this.requestBodyModal = ref; }}
										subject={subject}
										schema={this.state.requestSchema}
										endpointUrl={this.state.urlSubjectLink}
										hidden={this.state.hidden}
										isError={this.state.requestSchema ? this.state.requestSchema._error : false}
									/>}

								{this.state.responseSchema &&
									<JsonSchemaModalComponent
										ref={ref => { this.responseBodyModal = ref; }}
										subject={subject}
										schema={this.state.responseSchema}
										endpointUrl={this.state.urlSubjectLink}
										hidden={this.state.hidden}
										isError={this.state.responseSchema ? this.state.responseSchema._error : false}
									/>}

							</React.Fragment>
						}

					</React.Fragment>

				)}
			</ApiDocContext.Consumer>
		);
	}

	toggleFolded() {
		this.setState({ isOpen: !this.state.isOpen });
	}

    /**
     * Prepares the endpoint details table.
     *
     * @param {Object} context
     */
	getEndpointDetailsTable(context) {
		const {
			endpoint: {
				subject,
				serviceName,
				requestSchema,
				responseSchema,
				permissions,
				mustBeLoggedIn
			},
			type
		} = this.props;

		return (
			<table
				className="table table">

				<thead>
					<tr>
						<th>Subject</th>
						<th>Request body</th>
						<th>Required permissions</th>
					</tr>
				</thead>

				<tbody>
					<tr>
						{/* Subject */}
						<td>
							{subject}
							<CopyToClipboardButtonComponent
								copyData={subject}
								copyDescription="subject" />
						</td>
						{/* Request body */}
						<td
							onClick={e => this.openBodyModal(e, REQUEST_BODY)}
							className={`
                            request-schema
                            ${serviceName}
                            ${requestSchema}
                            ${(requestSchema ? " " : "deactivated")}
                            ${this.state.requestSchema && this.state.requestSchema._error ? "has-error" : ""}`}>
							<a
								href={requestSchema ? `#${this.state.urlSubjectLink}?modal=${requestSchema}` : "#"}
								className={requestSchema ? "" : "deactivated"}>
								{requestSchema || <span className="not-available"> n/a</span>}
								{requestSchema && <span className="glyphicon glyphicon-new-window"></span>}
							</a>

							{requestSchema
								&& <CopyToClipboardButtonComponent
									copyData={requestSchema}
									copyDescription="request schema name" />}
						</td>
						{/* Required permissions */}
						<td>
							<span
								className="quickfix">{ /** Note: Quickfix: this has to be span to prevent "or", "and" etc to appear because of the copy button */}
								{this.getPermissions()}
							</span>

							{permissions
								&& permissions.length > 0
								&& <CopyToClipboardButtonComponent
									copyData={permissions.join(",")}
									copyDescription="permissions" />}
						</td>
					</tr>
				</tbody>

				<thead>
					<tr>
						<th>Url</th>
						<th>Response body</th>
						<th>Must be logged in</th>
					</tr>
				</thead>

				<tbody>
					<tr>
						{/* Url */}
						<td>{
							type === "http"
								? <React.Fragment>
									{context.config.apiRoot + this.state.parsedSubject.url}

									<CopyToClipboardButtonComponent
										copyData={context.config.apiRoot + this.state.parsedSubject.url}
										copyDescription="url" />
								</React.Fragment>
								: <span className="not-available">n/a</span>

						}</td>

						{/* Response body */}
						<td
							onClick={e => this.openBodyModal(e, RESPONSE_BODY)}
							className={`
                            response-schema
                            ${serviceName}
                            ${responseSchema}
                            ${(responseSchema ? " " : "deactivated")}
                            ${this.state.responseSchema && this.state.responseSchema._error ? "has-error" : ""}`}>
							<a
								href={responseSchema ? `#${this.state.urlSubjectLink}?modal=${responseSchema}` : "#"}
								className={responseSchema ? "" : "deactivated"}>
								{responseSchema || <span className="not-available">n/a</span>}
								{responseSchema && <span className="glyphicon glyphicon-new-window"></span>}
							</a>

							{responseSchema
								&& <CopyToClipboardButtonComponent
									copyData={responseSchema}
									copyDescription="response schema name" />}
						</td>

						{/* Must be logged in */}
						<td
							className={
								(permissions
									&& permissions.length > 0)
									? true.toString()
									: mustBeLoggedIn.toString()
							}>
							{(permissions
								&& permissions.length > 0)
								? true.toString()
								: mustBeLoggedIn.toString()}
						</td>
					</tr>
				</tbody>

			</table>
		);
	}

    /**
     * Prepares the description table
     */
	getDocumentationTable() {
		const { endpoint: { docs } } = this.props;

		return (
			<table
				className="table table">

				<thead>
					<tr>
						<th>Documentation</th>
					</tr>
				</thead>

				<tbody>
					<tr>
						<td className="description">
							{docs ?
								<React.Fragment>
									{docs.description && <div className="doc-entry-title">Description</div>}
									{docs.description
										? <span className="description-value" dangerouslySetInnerHTML={{
											// @ts-ignore
											__html: markdown.markdown.toHTML(docs.description),
										}} />
										: <span className="not-available">n/a</span>}
									<span className="url-params-desc">{docs.params ? this.getDocEntry(docs.params, "Url parameters") : ""}</span>
									<span className="query-params-desc">{docs.query ? this.getDocEntry(docs.query, "Query parameters") : ""}</span>
									<span className="errors-desc">{docs.errors ? this.getDocEntry(docs.errors, "Errors") : ""}</span>
								</React.Fragment> : <span className="not-available">n/a</span>}
						</td>
					</tr>
				</tbody>

			</table>
		);
	}

    /**
     * Opens a modal with the request json schema.
     *
     * @param {Object} e
     */
	openBodyModal(e, type) {
		if (this.props.endpoint.hidden || !this.state.isOpen)
			return;

		if (e.nativeEvent.which !== 2 // if we mouse click with the middle mouse we want the browser to do its thing
			&& !e.target.className.includes("copy") // if the pressed target has class name "copy", we're hitting the copy to clipboard button
		) {
			e.preventDefault();

			if (type === "REQUEST_BODY") {
				if (this.requestBodyModal)
					this.requestBodyModal.openModal();
			} else if (type === "RESPONSE_BODY") {
				if (this.responseBodyModal)
					this.responseBodyModal.openModal();
			}
		}
	}

    /**
     * Renders all permissions no matter if a simple array or array in array.
     */
	getPermissions() {
		if (this.props.endpoint.permissions) {
			return this.props.endpoint.permissions.map((permissions, index) => {
				let permissionsHmtl;

				if (permissions instanceof Array)
					permissionsHmtl = permissions.map((permission, index) => {
						return (
							<span
								key={`permissions-${permission}`}
								className="permission">
								{permission}
							</span>
						);
					});
				else
					permissionsHmtl = <span className="permission">{permissions}</span>;

				return (
					<span
						key={`this-props-endpoint-permissions-${permissions.join ? permissions.join(",") : permissions}`}
						className="permission-group">
						{permissionsHmtl}
					</span>
				);
			});
		} else {
			return (
				<span className="permission-group">
					<span className="permission">none</span>
				</span>
			);
		}
	}

    /**
     * Renders documentation entry.
     *
     * @param {Object|Array} input
     * @param {String} title
     */
	getDocEntry(input, title) {
		if (Object.keys(input).length > 0) {
			return (
				<React.Fragment>
					<div className="doc-entry-title">{title}</div>
					{
						Object.keys(input).map((key, index) => {
							const value = input[key];

							return (
								<span key={`get-doc-entry-${key}`}>
									<div className="description-item">
										<span className="description-key">{key}</span>: <span className="description-value">{value}</span>
									</div>
								</span>
							);
						})
					}
				</React.Fragment>
			)
		}
	}

    /**
     * Returns note for special case endpoints
     * For instance a styled and "linkified" deprecation note
     */
	getInformationNote() {
		const { endpoint: { deprecated, pending } } = this.props;

		if (!deprecated && !pending)
			return <React.Fragment />;

		const getNote = () => {
			if (deprecated && typeof deprecated === "string")
				return (<span className="deprecated-note" dangerouslySetInnerHTML={{ __html: this.getDeprecatedHtml(deprecated) }} ></span>);
			else if (pending)
				return (<React.Fragment>This endpoint is not yet implemented!</React.Fragment>);
		}

		return (
			<React.Fragment>
				| <span className="deprecated-description">Note: </span>
				{getNote()}
			</React.Fragment>
		);
	}

    /**
     * Adds links to endpoints referenced in the deprecated text.
     *
     * @param {String} description
     */
	getDeprecatedHtml(description) {
		const parts = description.split(" ");
		const partsWithEndpoint = {};

		let endpointsExists = false;

		for (let i = 0; i < parts.length; i++) {
			let partToCompare = parts[i];
			let partHasDot = false;

			if (partToCompare[partToCompare.length - 1] === ".") {
				partToCompare = partToCompare.substring(0, partToCompare.length - 1);
				partHasDot = true;
			}

			if (this.props.allEndpoints.includes(partToCompare)) {
				endpointsExists = true;
				parts[i] = partToCompare;

				partsWithEndpoint[parts[i]] = parts[i];

				if (partHasDot)
					parts.splice(i + 1, 0, ".");
			}
		}

		if (!endpointsExists)
			return description;

		Object.keys(partsWithEndpoint).
			forEach(key => {
				if (key.includes("http")) {
					const parsedHttpEndpoint = ViewUtils.parseSubjectToAPIUrl(key);

					partsWithEndpoint[key] = `
                    <a href="#${parsedHttpEndpoint.method}-to-${parsedHttpEndpoint.url}">
                    <span class="${parsedHttpEndpoint.method}">${parsedHttpEndpoint.method}</span>
                     to ${parsedHttpEndpoint.url}
                    </a>`;
				} else
					partsWithEndpoint[key] = `<a href="#${key}">${ViewUtils.getColorCodedTitle(key)}</a>`;
			});

		const output = [];

		parts.forEach(pt => {
			if (partsWithEndpoint[pt])
				output.push(partsWithEndpoint[pt]);
			else
				output.push(pt);
		});

		return `${output.join(" ")}`;
	}

}
