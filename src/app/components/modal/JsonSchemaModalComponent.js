import hljs from "highlight.js";
import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import CopyToClipboardComponent from "../copy-to-clipboard/CopyToClipboardComponent";

hljs.configure({ languages: ["json"] });

function getTabFromHash() {
    try {
        const decodedURIHash = decodeURI(window.location.hash);
        const windowLocationTab = Number.parseInt(decodedURIHash.substring(decodedURIHash.length - 1));

        return windowLocationTab || 0;
    } catch (err) {
        return 0;
    }
}

function cssFriendlify(string) {
    if (!string)
        return string;

    return string
        .split("/").join("")
        .split("#").join("")
        .split(":").join("")
        .split(".").join("");
}

export default class JsonSchemaModalComponent extends React.Component {

    constructor(props) {
        super(props);

        if (this.props.schema) {
            // @ts-ignore
            this.state = this.state || {};
            this.state.schema = this.props.schema;

            const schemaToJson = Object.assign({}, this.state.schema);
            this.state.jsonSample = schemaToJson && schemaToJson.sample ? JSON.stringify(ViewUtils.sortObject(schemaToJson.sample), null, 2) : undefined;
            delete schemaToJson.sample;

            this.state.jsonSchema = JSON.stringify(ViewUtils.sortObject(schemaToJson), null, 2);
        } else
            this.state.schema = {};
    }

    // @ts-ignore
    state = {
        colorized: false,
        modal: {},
        currentTabIndex: getTabFromHash()
    };

    async setInitialOpenState() {
        if (this.props.isError)
            await this.goToTab(1);
        else
            await this.goToTab(getTabFromHash());
    }

    render() {
        if (this.state.schema)
            return (
                <div
                    style={{ cursor: "default" }}
                    ref={(ref) => { this.state.modal = ref; }}
                    className="modal bd-example-modal-lg"
                    role="dialog"
                    aria-labelledby="myLargeModalLabel"
                    aria-hidden="true" >

                    <div className="modal-dialog modal-lg">

                        <div className={`modal-content ${this.props.isError ? "alert alert-danger" : ""}`}>
                            <span
                                className="glyphicon glyphicon-remove close"
                                id="close-btn"
                                onClick={() => this.closeModal()}>
                            </span>

                            <h1 id="header">{this.state.schema.id}</h1>
                            <p>{this.props.isError ? "Contains errors" : this.state.schema.description}</p>

                            <hr />

                            {this.props.isError ?
                                <ul className="nav nav-tabs">
                                    <li className="nav-item clickable">
                                        <a className={`nav-link ${this.state.currentTabIndex === 1 ? "active" : ""}`} onClick={() => this.goToTab(1)}>Error message</a>
                                    </li>
                                    <li className="nav-item clickable">
                                        <a className={`nav-link ${this.state.currentTabIndex === 2 ? "active" : ""}`} onClick={() => this.goToTab(2)}>Full error</a>
                                    </li>
                                </ul>
                                :
                                <ul className="nav nav-tabs">
                                    <li className="nav-item clickable">
                                        <a className={`nav-link ${this.state.currentTabIndex === 0 ? "active" : ""}`} onClick={() => this.goToTab(0)}>Definition</a>
                                    </li>
                                    <li className="nav-item clickable">
                                        <a className={`nav-link ${this.state.currentTabIndex === 1 ? "active" : ""}`} onClick={() => this.goToTab(1)}>Sample</a>
                                    </li>
                                    <li className="nav-item clickable">
                                        <a className={`nav-link ${this.state.currentTabIndex === 2 ? "active" : ""}`} onClick={() => this.goToTab(2)}>Json schema</a>
                                    </li>
                                </ul>
                            }

                            <div id={`docson-${cssFriendlify(this.props.endpointUrl)}-${this.state.schema.id}`}
                                className="docson-entry"
                                hidden={this.state.currentTabIndex !== 0} >
                                <br />
                            </div>

                            <span className="modal-container"
                                hidden={this.state.currentTabIndex !== 1}>
                                {this.renderSample()}
                            </span>

                            <span className="modal-container"
                                hidden={this.state.currentTabIndex !== 2}>
                                {this.renderJsonSchema()}
                            </span>

                        </div>

                    </div>

                </div>
            );

        else return <span />
    }

    renderSample() {
        if (!this.state.jsonSample)
            return <span />;

        return (
            <React.Fragment>

                <button
                    style={{
                        display: "inline",
                        marginTop: "20px"
                    }}
                    className="action btn-copy"
                    id="copy-sample"
                    onClick={e => this.copyJsonSampleToClipboard.copyToClipboard()}>

                    <CopyToClipboardComponent
                        ref={ref => this.copyJsonSampleToClipboard = ref}
                        copyData={this.state.jsonSample} />

                    Copy to clipboard <span className="glyphicon glyphicon-copy"></span>

                </button>

                <div className="clearfix" />

                <pre
                    ref={ref => { this.state.jsonSampleElem = ref; }}>
                    {/* Since errors have some HTML formatted elements: */}
                    <code
                        id="sample-json"
                        dangerouslySetInnerHTML={{ __html: this.state.jsonSample }} />
                </pre>

            </React.Fragment>
        );
    }

    renderJsonSchema() {
        if (!this.state.jsonSchema)
            return <span />;

        return (
            <React.Fragment>
                <button
                    style={{
                        display: "inline",
                        marginTop: "20px"
                    }}
                    className="action btn-copy"
                    id="copy-json-schema"
                    onClick={() => this.copyJsonSchemaToClipboard.copyToClipboard()}>

                    <CopyToClipboardComponent
                        ref={ref => this.copyJsonSchemaToClipboard = ref}
                        copyData={this.state.jsonSchema} />

                    Copy to clipboard <span className="glyphicon glyphicon-copy"></span>

                </button>

                {this.state.jsonSchema.length > 0 ?
                    <React.Fragment>

                        <div className="clearfix" />

                        <pre
                            ref={ref => { this.state.jsonSchemaElem = ref; }}>
                            {/* Since errors have some HTML formatted elements: */}
                            <code
                                id="json-schema-json"
                                dangerouslySetInnerHTML={{ __html: this.state.jsonSchema }} />
                        </pre>

                    </React.Fragment> : "No further details available."}

            </React.Fragment>
        );
    }

    async openModal() {
        if (this.props.hidden)
            return;

        try {
            await this.setInitialOpenState();

            history.replaceState(undefined, undefined, `#${this.props.endpointUrl}?modal=${this.state.schema.id}&tab=${this.state.currentTabIndex}`)

            const schemaToJson = ViewUtils.sortObject(Object.assign({}, this.state.schema));
            delete schemaToJson.sample;

            /**
             * Only works when frontend is loaded with bootstrap / jquery
             */
            if ($) {
                // @ts-ignore
                $(this.state.modal).modal();
                $(this.state.modal).on("hide.bs.modal", () => {
                    this.resetModalHash();
                });
            }

            if (!this.props.isError) {
                const docson = nodeDocson();
                docson.doc(schemaToJson, `docson-${cssFriendlify(this.props.endpointUrl)}-${this.state.schema.id}`);
            }
        } catch (err) {
            console.warn(err);
        }
    }

    closeModal() {
        this.resetModalHash();

        if ($ && !this.props.hidden)
            // @ts-ignore
            $(this.state.modal).modal("hide");
    }

    resetModalHash() {
        if (!this.props.hidden)
            history.replaceState(undefined, undefined, `#${this.props.endpointUrl}`);
    }

    async goToTab(index) {
        await this.setState({ currentTabIndex: index });

        if (index === 2)
            hljs.highlightBlock(this.state.jsonSchemaElem);

        if (index === 1)
            hljs.highlightBlock(this.state.jsonSampleElem);

        window.location.hash = `${window.location.hash.substring(0, window.location.hash.length - 1)}${index}`;
    }

}