import markdown from "markdown";
import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import { ApiDocContext } from "../../Context";
import JsonSchemaModalComponent from "../modal/JsonSchemaModalComponent";
import CopyAsCurlComponent from "./copy-as-curl/CopyAsCurlComponent";


export default class EndpointDetailsComponent extends React.Component {

    constructor(props) {
        super(props);

        this.parsedSubject = ViewUtils.parseSubjectToAPIUrl(this.props.endpoint.subject);

        if (this.props.type === "http") {
            this.urlSubjectLink = `${this.parsedSubject.method}-to-${this.parsedSubject.url}`;
            this.urlSubject = `<span class="${this.parsedSubject.method}">${this.parsedSubject.method}</span> to ${this.parsedSubject.url}`;
        } else {
            this.urlSubjectLink = this.props.endpoint.subject;
            this.urlSubject = ViewUtils.getColorCodedTitle(this.props.endpoint.subject);
        }

        this.requestSchema = this.props.schemas.find(schema => schema.id === this.props.endpoint.requestSchema);
        this.responseSchema = this.props.schemas.find(schema => schema.id === this.props.endpoint.responseSchema);

        this.isOpen = false;

        this.lastLocationHash = "";
        this.selected = false;
    }

    componentDidMount() {
        addEventListener("hashchange", (e) => {
            reactToHashChange();
        }, false);

        const reactToHashChange = () => {
            if (decodeURI(window.location.hash) === `#${this.urlSubjectLink}`
                && decodeURI(window.location.hash) !== this.lastLocationHash) {
                this.selected = true;

                if (!this.isOpen) {
                    this.isOpen = true;
                    this.forceUpdate();
                }

                setTimeout(() => {
                    this.selected = false;
                    this.forceUpdate();
                }, 100);

                if (this.markup)
                    this.markup.scrollIntoView(true);
            }

            this.lastLocationHash = decodeURI(window.location.hash);
        }

        reactToHashChange();
    }

    render() {
        return (
            <ApiDocContext.Consumer>
                {context => (
                    <span>
                        <div
                            ref={ref => this.markup = ref}
                            id={this.urlSubjectLink}
                            className={`
                                ${this.props.endpoint.deprecated ? "deprecated-container" : ""} container endpoint-container
                                ${this.selected ? "selected-animated" : ""}
                            `}>
                            <span>
                                <span>
                                    <span
                                        className={`endpoint-fold-btn ${this.isOpen ? "open" : ""}`}
                                        onClick={() => this.toggleFolded()}>
                                        {this.isOpen ?
                                            <i className="toggle-fold-btn glyphicon glyphicon-menu-down"></i>
                                            : <i className="toggle-fold-btn glyphicon glyphicon-menu-right"></i>}
                                    </span>

                                    <a href={"#" + this.urlSubjectLink}>
                                        <h3
                                            style={{ display: "inline-block" }}
                                            className={this.props.endpoint.deprecated ? "deprecated" : ""}>
                                            <span dangerouslySetInnerHTML={{ __html: this.urlSubject, }}></span>
                                        </h3>
                                    </a>
                                </span>

                                <span className="endpoint-second-row">
                                    from {this.props.endpoint.instanceId} {this.getDeprecationNote()}

                                    <CopyAsCurlComponent cUrl={this.props.endpoint.cUrl} />

                                </span>

                            </span>

                            {
                                this.isOpen ? <span>

                                    {this.getEndpointDetailsTable(context)}

                                    {this.getDocumentationTable(context)}

                                </span> : ""
                            }

                        </div>

                        {
                            this.isOpen ? <span>

                                <JsonSchemaModalComponent
                                    ref={ref => { this.requestBodyModal = ref; }}
                                    subject={this.props.endpoint.subject}
                                    schema={this.requestSchema} />

                                <JsonSchemaModalComponent
                                    ref={ref => { this.responseBodyModal = ref; }}
                                    subject={this.props.endpoint.subject}
                                    schema={this.responseSchema} />

                            </span> : ""
                        }

                    </span>

                )}
            </ApiDocContext.Consumer>
        );
    }

    toggleFolded() {
        this.isOpen = !this.isOpen;
        this.forceUpdate();
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
                            className={`request-schema ${this.props.endpoint.serviceName} ${this.props.endpoint.requestSchema} ${(this.props.endpoint.requestSchema ? " " : "deactivated")}`}>
                            <a href=""
                                className={this.props.endpoint.requestSchema ? "" : "deactivated"}>
                                {this.props.endpoint.requestSchema || <span className="not-available"> n/a</span>}
                                {this.props.endpoint.requestSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}
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
                                ? context.config.apiRoot + this.parsedSubject.url
                                : <span className="not-available">n/a</span>
                        }</td>

                        {/* Response body */}
                        <td onClick={e => this.openResponseBodyModal(e)}
                            className={`response-schema ${this.props.endpoint.serviceName} ${this.props.endpoint.responseSchema} ${(this.props.endpoint.responseSchema ? " " : "deactivated")}`}>
                            <a href=""
                                className={this.props.endpoint.responseSchema ? "" : "deactivated"}>
                                {this.props.endpoint.responseSchema || <span className="not-available">n/a</span>}
                                {this.props.endpoint.responseSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}
                            </a>
                        </td>

                        {/* Must be logged in */}
                        <td className={(this.props.endpoint.permissions && this.props.endpoint.permissions.length > 0) ? true.toString() : this.props.endpoint.mustBeLoggedIn.toString()}>
                            {(this.props.endpoint.permissions && this.props.endpoint.permissions.length > 0) ? true.toString() : this.props.endpoint.mustBeLoggedIn.toString()}
                        </td>
                    </tr>
                </tbody>

            </table>
        );
    }

    /**
     * Prepares the description table
     * 
     * @param {Object} context 
     */
    getDocumentationTable(context) {
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
                                    {this.props.endpoint.docs.description ? <div className="doc-entry-title">Description</div> : ""}
                                    {this.props.endpoint.docs.description ?
                                        <span className="description-value" dangerouslySetInnerHTML={{ __html: markdown.markdown.toHTML(this.props.endpoint.docs.description), }}></span>
                                        : <span className="not-available">n/a</span>}
                                    {this.props.endpoint.docs.params ? this.getDocEntry(this.props.endpoint.docs.params, "Url parameters") : ""}
                                    {this.props.endpoint.docs.query ? this.getDocEntry(this.props.endpoint.docs.query, "Query parameters") : ""}
                                    {this.props.endpoint.docs.errors ? this.getDocEntry(this.props.endpoint.docs.errors, "Errors") : ""}
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
        e.preventDefault();
        this.requestBodyModal.openModal();
    }

    /**
     * Opens a modal with the response json schema.
     * 
     * @param {Object} e 
     */
    openResponseBodyModal(e) {
        e.preventDefault();
        this.responseBodyModal.openModal();
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