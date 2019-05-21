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
                    // if ($) $(".modal").modal("hide");

                    if (this.requestBodyModal)
                        this.requestBodyModal.openModal();
                } else if (this.state.responseSchema && decodedURI.includes(`?modal=${this.state.responseSchema.id}`)) {
                    // if ($) $(".modal").modal("hide");

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
                docs
            },
            type,
            checked,
            onCheck
        } = this.props;

        return (
            <ApiDocContext.Consumer>
                {context => (
                    <span>
                        <div
                            ref={ref => this.markup = ref}
                            id={this.state.urlSubjectLink}
                            className={`
                                ${deprecated ? "deprecated-container" : ""} 
                                ${pending ? "pending-container" : ""} 
                                container endpoint-container
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
                                            className={`
                                                ${deprecated ? "deprecated" : ""}
                                                ${pending ? "pending" : ""}
                                            `}>
                                            <span dangerouslySetInnerHTML={{ __html: this.state.urlSubject, }}></span>
                                        </h3>
                                    </a>
                                </span>

                                <span className="endpoint-second-row">
                                    from {instanceId} {this.getInformationNote()}

                                    <CopyAsCurlComponent cUrl={cUrl} />

                                    {type === "service" && <input
                                        type="checkbox"
                                        name={subject}
                                        checked={checked}
                                        onChange={onCheck}
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
                                    docs
                                    && docs.description
                                    && <span
                                        onClick={e => this.toggleFolded()}
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

                            <span>

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
                        <td>{subject}</td>
                        {/* Request body */}
                        <td
                            onClick={e => this.openRequestBodyModal(e)}
                            className={`
                            request-schema
                            ${serviceName} 
                            ${requestSchema} 
                            ${(requestSchema ? " " : "deactivated")}
                            ${this.state.requestSchema && this.state.requestSchema._error ? "has-error" : ""}`}>
                            <a href={requestSchema ? `#${this.state.urlSubjectLink}?modal=${requestSchema}` : "#"}
                                className={requestSchema ? "" : "deactivated"}>
                                {requestSchema || <span className="not-available"> n/a</span>}
                                {requestSchema && <span className="glyphicon glyphicon-new-window"></span>}
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
                            type === "http"
                                ? context.config.apiRoot + this.state.parsedSubject.url
                                : <span className="not-available">n/a</span>
                        }</td>

                        {/* Response body */}
                        <td
                            onClick={e => this.openResponseBodyModal(e)}
                            className={`
                            response-schema
                            ${serviceName} 
                            ${responseSchema} 
                            ${(responseSchema ? " " : "deactivated")}
                            ${this.state.responseSchema && this.state.responseSchema._error ? "has-error" : ""}`}>
                            <a href={responseSchema ? `#${this.state.urlSubjectLink}?modal=${responseSchema}` : "#"}
                                className={responseSchema ? "" : "deactivated"}>
                                {responseSchema || <span className="not-available">n/a</span>}
                                {responseSchema && <span className="glyphicon glyphicon-new-window"></span>}
                            </a>
                        </td>

                        {/* Must be logged in */}
                        <td
                            className={(permissions && permissions.length > 0) ? true.toString() : mustBeLoggedIn.toString()}>
                            {(permissions && permissions.length > 0) ? true.toString() : mustBeLoggedIn.toString()}
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
                                <div>
                                    {docs.description && <div className="doc-entry-title">Description</div>}
                                    {docs.description
                                        ? <span className="description-value" dangerouslySetInnerHTML={{
                                            // @ts-ignore
                                            __html: markdown.markdown.toHTML(docs.description),
                                        }}></span>
                                        : <span className="not-available">n/a</span>}
                                    <span className="url-params-desc">{docs.params ? this.getDocEntry(docs.params, "Url parameters") : ""}</span>
                                    <span className="query-params-desc">{docs.query ? this.getDocEntry(docs.query, "Query parameters") : ""}</span>
                                    <span className="errors-desc">{docs.errors ? this.getDocEntry(docs.errors, "Errors") : ""}</span>
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
        if (this.props.endpoint.hidden || !this.state.isOpen)
            return;

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
        if (this.props.endpoint.hidden || !this.state.isOpen)
            return;

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
     * Returns note for special case endpoints
     * For instance a styled and "linkified" deprecation note
     */
    getInformationNote() {
        const { endpoint: { deprecated, pending } } = this.props;

        if (!deprecated && !pending)
            return <span />;

        const getNote = () => {
            if (deprecated && typeof deprecated === "string") {
                return (<span className="deprecated-note" dangerouslySetInnerHTML={{ __html: this.getDeprecatedHtml(deprecated) }} ></span>);
            } else if (pending) {
                return (<span>This endpoint is not yet implemented!</span>);
            }
        }

        return (
            <span>
                | <span className="deprecated-description">Note: </span>
                {getNote()}
            </span>
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