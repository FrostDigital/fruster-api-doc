import markdown from "markdown";
import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import { ApiDocContext } from "../../Context";
import JsonSchemaModalComponent from "../modal/JsonSchemaModalComponent";
import CopyAsCurlComponent from "./copy-as-curl/CopyAsCurlComponent";


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

        if (this.props.type === "http")
            return `<span class="${parsedSubject.method}">${parsedSubject.method}</span> to ${parsedSubject.url}`;
        else
            return ViewUtils.getColorCodedTitle(this.props.endpoint.subject);
    }

    componentDidMount() {
        addEventListener("hashchange", () => this.reactToHashChange(), false);
        setTimeout(() => this.reactToHashChange());
    }

    async reactToHashChange() {
        const decodedURI = decodeURI(window.location.hash);
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
                    if ($) $(".modal").modal("hide");

                    this.requestBodyModal.openModal();
                } else if (this.state.responseSchema && decodedURI.includes(`?modal=${this.state.responseSchema.id}`)) {
                    if ($) $(".modal").modal("hide");

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
        return (
            <ApiDocContext.Consumer>
                {context => (
                    <span>
                        <div
                            ref={ref => this.markup = ref}
                            id={this.state.urlSubjectLink}
                            className={`
                                ${this.props.endpoint.deprecated ? "deprecated-container" : ""} container endpoint-container
                                ${this.state.selected ? "selected-animated" : ""}
                            `}>
                            <span>
                                <span>
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
                                            className={this.props.endpoint.deprecated ? "deprecated" : ""}>
                                            <span dangerouslySetInnerHTML={{ __html: this.state.urlSubject, }}></span>
                                        </h3>
                                    </a>
                                </span>

                                <span className="endpoint-second-row">
                                    from {this.props.endpoint.instanceId} {this.getDeprecationNote()}

                                    <CopyAsCurlComponent cUrl={this.props.endpoint.cUrl} />

                                    {this.props.type === "service" && <input
                                        type="checkbox"
                                        name={this.props.endpoint.subject}
                                        checked={this.props.checked}
                                        onChange={this.props.onCheck}
                                        style={{ float: "right" }} />}

                                </span>

                            </span>

                            {
                                this.state.isOpen ?

                                    <span>

                                        {this.getEndpointDetailsTable(context)}

                                        {this.getDocumentationTable()}

                                    </span>

                                    :
                                    this.props.endpoint.docs
                                    && this.props.endpoint.docs.description
                                    && <span
                                        onClick={e => this.toggleFolded()}
                                        title={this.props.endpoint.docs ? this.props.endpoint.docs.description : ""}
                                        className="short-description"
                                        dangerouslySetInnerHTML={{ __html: markdown.markdown.toHTML(this.props.endpoint.docs.description) }} />
                            }

                        </div>

                        {
                            this.state.isOpen &&

                            <span>

                                {this.state.requestSchema &&
                                    <JsonSchemaModalComponent
                                        ref={ref => { this.requestBodyModal = ref; }}
                                        subject={this.props.endpoint.subject}
                                        schema={this.state.requestSchema}
                                        endpointUrl={this.state.urlSubjectLink}
                                        isError={this.state.requestSchema ? this.state.requestSchema._error : false}
                                    />}

                                {this.state.responseSchema &&
                                    <JsonSchemaModalComponent
                                        ref={ref => { this.responseBodyModal = ref; }}
                                        subject={this.props.endpoint.subject}
                                        schema={this.state.responseSchema}
                                        endpointUrl={this.state.urlSubjectLink}
                                        isError={this.state.responseSchema ? this.state.responseSchema._error : false}
                                    />}

                            </span>
                        }

                    </span>

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
                        <td>{this.props.endpoint.subject}</td>
                        {/* Request body */}
                        <td
                            onClick={e => this.openRequestBodyModal(e)}
                            className={`
                            request-schema
                            ${this.props.endpoint.serviceName} 
                            ${this.props.endpoint.requestSchema} 
                            ${(this.props.endpoint.requestSchema ? " " : "deactivated")}
                            ${this.state.requestSchema && this.state.requestSchema._error ? "has-error" : ""}`}>
                            <a href={this.props.endpoint.requestSchema ? `#${this.state.urlSubjectLink}?modal=${this.props.endpoint.requestSchema}` : "#"}
                                className={this.props.endpoint.requestSchema ? "" : "deactivated"}>
                                {this.props.endpoint.requestSchema || <span className="not-available"> n/a</span>}
                                {this.props.endpoint.requestSchema && <span className="glyphicon glyphicon-new-window"></span>}
                            </a>
                        </td>
                        {/* Required permissions */}
                        <td>
                            {this.getPermissions()}
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
                            this.props.type === "http"
                                ? context.config.apiRoot + this.state.parsedSubject.url
                                : <span className="not-available">n/a</span>
                        }</td>

                        {/* Response body */}
                        <td
                            onClick={e => this.openResponseBodyModal(e)}
                            className={`
                            response-schema
                            ${this.props.endpoint.serviceName} 
                            ${this.props.endpoint.responseSchema} 
                            ${(this.props.endpoint.responseSchema ? " " : "deactivated")}
                            ${this.state.responseSchema && this.state.responseSchema._error ? "has-error" : ""}`}>
                            <a href={this.props.endpoint.responseSchema ? `#${this.state.urlSubjectLink}?modal=${this.props.endpoint.responseSchema}` : "#"}
                                className={this.props.endpoint.responseSchema ? "" : "deactivated"}>
                                {this.props.endpoint.responseSchema || <span className="not-available">n/a</span>}
                                {this.props.endpoint.responseSchema && <span className="glyphicon glyphicon-new-window"></span>}
                            </a>
                        </td>

                        {/* Must be logged in */}
                        <td
                            className={(this.props.endpoint.permissions && this.props.endpoint.permissions.length > 0) ? true.toString() : this.props.endpoint.mustBeLoggedIn.toString()}>
                            {(this.props.endpoint.permissions && this.props.endpoint.permissions.length > 0) ? true.toString() : this.props.endpoint.mustBeLoggedIn.toString()}
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
                            {this.props.endpoint.docs ?
                                <div>
                                    {this.props.endpoint.docs.description && <div className="doc-entry-title">Description</div>}
                                    {this.props.endpoint.docs.description
                                        ? <span className="description-value" dangerouslySetInnerHTML={{ __html: markdown.markdown.toHTML(this.props.endpoint.docs.description), }}></span>
                                        : <span className="not-available">n/a</span>}
                                    <span className="url-params-desc">{this.props.endpoint.docs.params ? this.getDocEntry(this.props.endpoint.docs.params, "Url parameters") : ""}</span>
                                    <span className="query-params-desc">{this.props.endpoint.docs.query ? this.getDocEntry(this.props.endpoint.docs.query, "Query parameters") : ""}</span>
                                    <span className="errors-desc">{this.props.endpoint.docs.errors ? this.getDocEntry(this.props.endpoint.docs.errors, "Errors") : ""}</span>
                                </div> : <span className="not-available">n/a</span>}
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
    openRequestBodyModal(e) {
        if (e.nativeEvent.which !== 2) {
            e.preventDefault();

            if (this.requestBodyModal)
                this.requestBodyModal.openModal();
        }
    }

    /**
     * Opens a modal with the response json schema.
     * 
     * @param {Object} e 
     */
    openResponseBodyModal(e) {
        if (e.nativeEvent.which !== 2) {
            e.preventDefault();

            if (this.responseBodyModal)
                this.responseBodyModal.openModal();
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
                                key={`permissions-${index}`}
                                className="permission">
                                {permission}
                            </span>
                        );
                    });
                else
                    permissionsHmtl = <span className="permission">{permissions}</span>;

                return (
                    <span
                        key={`this-props-endpoint-permissions-${index}`}
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
                <div>
                    <div className="doc-entry-title">{title}</div>
                    {
                        Object.keys(input).map((key, index) => {
                            const value = input[key];

                            return (
                                <span key={`get-doc-entry-${index}`}>
                                    <div className="description-item">
                                        <span className="description-key">{key}</span>: <span className="description-value">{value}</span>
                                    </div>
                                </span>
                            );
                        })
                    }
                </div>
            )
        }
    }

    /**
     * Returns styled and "linkified" deprecation note
     */
    getDeprecationNote() {
        if (this.props.endpoint.deprecated && typeof this.props.endpoint.deprecated === "string") {
            return (
                <span>
                    | <span className="deprecated-description">Note: </span>
                    <span className="deprecated-note" dangerouslySetInnerHTML={{ __html: this.getDeprecatedHtml(this.props.endpoint.deprecated) }} ></span>
                </span>
            );
        }
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

            if (this.props.allEndpoints[partToCompare]) {
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

        return `<span>${output.join(" ")}</span>`;
    }

}