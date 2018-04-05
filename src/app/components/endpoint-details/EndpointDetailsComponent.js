import React from "react";
import $ from "jquery";
import SharedUtils from "../../../utils/SharedUtils";
import config from "../../../../config";

import CopyAsCurlComponent from "./copy-as-curl/CopyAsCurlComponent";
import JsonSchemaModalComponent from "../modal/JsonSchemaModalComponent";

export default class EndpointDetailsComponent extends React.Component {

    constructor(props) {
        super(props);

        this.parsedSubject = SharedUtils.parseSubjectToAPIUrl(this.props.endpoint.subject);

        if (this.props.type === "http") {
            this.props.endpoint.urlSubjectLink = `${this.parsedSubject.method}-to-${this.parsedSubject.url}`;
            this.props.endpoint.urlSubject = `<span class="${this.parsedSubject.method}">${this.parsedSubject.method}</span> to ${this.parsedSubject.url}`;
        } else {
            this.props.endpoint.urlSubjectLink = this.props.endpoint.subject;
            this.props.endpoint.urlSubject = SharedUtils.getColorCodedTitle(this.props.endpoint.subject);
        }

        this.requestSchema = this.props.schemas.find(schema => schema.id === this.props.endpoint.requestSchema);
        this.responseSchema = this.props.schemas.find(schema => schema.id === this.props.endpoint.responseSchema);
    }

    render() {
        return (
            <span>
                <JsonSchemaModalComponent
                    ref={ref => { this.requestBodyModal = ref; }}
                    subject={this.props.endpoint.subject}
                    schema={this.requestSchema} />

                <JsonSchemaModalComponent
                    ref={ref => { this.responseBodyModal = ref; }}
                    subject={this.props.endpoint.subject}
                    schema={this.responseSchema} />

                <div id={this.props.endpoint.urlSubjectLink} className={(this.props.endpoint.deprecated ? "deprecated-container" : "") + " container endpoint-container"}>
                    <span>
                        <span>
                            <a href={"#" + this.props.endpoint.urlSubjectLink}>
                                <h3 className={this.props.endpoint.deprecated ? "deprecated" : ""} dangerouslySetInnerHTML={{ __html: this.props.endpoint.urlSubject }}></h3>
                            </a>
                        </span>
                        <span className="endpoint-second-row">
                            from {this.props.endpoint.instanceId} {this.getDeprecationNote()}

                            <CopyAsCurlComponent cUrl={this.props.endpoint.cUrl} />
                        </span>
                    </span>

                    <table className="table table">

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
                                    className={"request-schema" + " " + this.props.endpoint.serviceName + " " + this.props.endpoint.requestSchema + " " + (this.props.endpoint.requestSchema ? " " : "deactivated")}>
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
                                        ? config.apiRoot + this.parsedSubject.url
                                        : <span className="not-available">n/a</span>
                                }</td>

                                {/* Response body */}
                                <td onClick={e => this.openResponseBodyModal(e)}
                                    className={"response-schema" + " " + this.props.endpoint.serviceName + " " + this.props.endpoint.responseSchema + " " + (this.props.endpoint.responseSchema ? " " : "deactivated")}>
                                    <a href="" className={this.props.endpoint.responseSchema ? "" : "deactivated"} >{this.props.endpoint.responseSchema || <span className="not-available">n/a</span>} {this.props.endpoint.responseSchema ? <span className="glyphicon glyphicon-new-window"></span> : ""}</a>
                                </td>

                                {/* Must be logged in */}
                                <td className={(this.props.endpoint.permissions && this.props.endpoint.permissions.length > 0) ? true.toString() : this.props.endpoint.mustBeLoggedIn.toString()}>
                                    {(this.props.endpoint.permissions && this.props.endpoint.permissions.length > 0) ? true.toString() : this.props.endpoint.mustBeLoggedIn.toString()}
                                </td>
                            </tr>
                        </tbody>

                    </table>

                    <table className="table table">

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
                                            {this.props.endpoint.docs.description ? <span className="description-value"> {this.props.endpoint.docs.description}</span> : <span className="not-available">n/a</span>}
                                            {this.props.endpoint.docs.params ? this.getDocEntry(this.props.endpoint.docs.params, "Url parameters") : ""}
                                            {this.props.endpoint.docs.query ? this.getDocEntry(this.props.endpoint.docs.query, "Query parameters") : ""}
                                            {this.props.endpoint.docs.errors ? this.getDocEntry(this.props.endpoint.docs.errors, "Errors") : ""}
                                        </div> : <span className="not-available">n/a</span>}
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>
            </span>
        );
    }

    openRequestBodyModal(e) {
        e.preventDefault();
        this.requestBodyModal.openModal();
    }

    openResponseBodyModal(e) {
        e.preventDefault();
        this.responseBodyModal.openModal();
    }

    /**
     * Renders all permissions no matter if a simple array or array in array.
     */
    getPermissions() {
        return this.props.endpoint.permissions
            ? this.props.endpoint.permissions.map(permissions => {
                return <span className="permission-group">
                    {
                        permissions instanceof Array
                            ? permissions.map(permission => { return <span className="permission">{permission}</span> })
                            : <span className="permission">{permissions}</span>
                    }
                </span>
            })
            : <span className="permission-group">
                <span className="permission">none</span>
            </span>
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
                        Object.keys(input).map(key => {
                            const value = input[key];

                            return (
                                <span>
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
        let endpoint = "";
        let endpointsExists = false;

        for (let i = 0; i < parts.length; i++) {
            if (this.props.allEndpoints[parts[i]]) {
                endpointsExists = true;
                partsWithEndpoint[parts[i]] = parts[i];
            }
        }

        if (!endpointsExists)
            return description;

        Object.keys(partsWithEndpoint).
            forEach(key => {
                if (key.includes("http")) {
                    const parsedHttpEndpoint = SharedUtils.parseSubjectToAPIUrl(key);
                    partsWithEndpoint[key] = `
                    <a href="#${parsedHttpEndpoint.method}-to-${parsedHttpEndpoint.url}">
                    <span class="${parsedHttpEndpoint.method}">${parsedHttpEndpoint.method}</span>
                     to ${parsedHttpEndpoint.url}
                    </a>`;

                } else
                    partsWithEndpoint[key] = `<a href="#${key}">${SharedUtils.getColorCodedTitle(key)}</a>`;
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