import hljs from "highlight.js";
import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import CopyToClipboardComponent from "../copy-to-clipboard/CopyToClipboardComponent";

hljs.configure({ languages: ["json"] });

export default class JsonSchemaModalComponent extends React.Component {

    constructor(props) {
        super(props);

        if (this.props.schema) {
            const schemaToJson = Object.assign({}, this.props.schema);
            delete schemaToJson.sample;

            this.jsonSchema = JSON.stringify(ViewUtils.sortObject(schemaToJson), null, 2);
            this.jsonSample = JSON.stringify(this.props.schema.sample, null, 2);
        }

        this.colorized = false;

        this.modal = {};

        this.setOpenState();
    }

    setOpenState() {
        this.jsonSchemaIsOpen = false;
        this.sampleIsOpen = true;
    }

    render() {
        if (this.props.schema)
            return (
                <div
                    style={{ cursor: "default" }}
                    ref={(ref) => { this.modal = ref; }}
                    className="modal bd-example-modal-lg"
                    role="dialog"
                    aria-labelledby="myLargeModalLabel"
                    aria-hidden="true" >

                    <div className="modal-dialog modal-lg">

                        <div className="modal-content">
                            <span
                                className="glyphicon glyphicon-remove close"
                                id="close-btn"
                                onClick={e => this.closeModal()}>
                            </span>

                            <h1 id="header">
                                {this.props.schema.id}
                            </h1>

                            <a
                                hidden={this.props.isError}
                                className="clickable"
                                onClick={() => this.goToSample()}>
                                <div>Go to sample</div>
                            </a>
                            <a
                                hidden={this.props.isError}
                                className="clickable"
                                onClick={() => this.goToJsonSchema()}>
                                <div>Go to json Schema</div>
                            </a>

                            <hr />

                            <span className="modal-container">
                                <span
                                    className={`endpoint-fold-btn ${this.sampleIsOpen ? "open" : ""}`}
                                    onClick={() => this.toggleSampleFolded()}>
                                    {this.sampleIsOpen ?
                                        <i className="toggle-fold-btn json-schema glyphicon glyphicon-menu-down"></i>
                                        : <i className="toggle-fold-btn json-schema glyphicon glyphicon-menu-right"></i>}
                                </span>
                                <h2
                                    className="clickable"
                                    onClick={() => this.goToSample()}
                                    ref={ref => this.sampleHeader = ref}
                                    style={{ display: "inline-block" }}
                                    id={`sample-${this.props.subject}-${this.props.schema.id}`}>
                                    {this.props.isError ? "Error message" : "Sample"}
                                </h2>

                                {this.renderSample()}

                            </span>

                            <hr />

                            <span className="modal-container">
                                <span
                                    className={`endpoint-fold-btn ${this.jsonSchemaIsOpen ? "open" : ""}`}
                                    onClick={() => this.toggleJsonSchemaFolded()}>
                                    {this.jsonSchemaIsOpen ?
                                        <i className="toggle-fold-btn json-schema glyphicon glyphicon-menu-down"></i>
                                        : <i className="toggle-fold-btn json-schema glyphicon glyphicon-menu-right"></i>}
                                </span>
                                <h2
                                    className="clickable"
                                    onClick={() => this.goToJsonSchema()}
                                    ref={ref => this.jsonSchemaHeader = ref}
                                    style={{ display: "inline-block" }}
                                    id={`schema-${this.props.subject}-${this.props.schema.id}`}>
                                    {this.props.isError ? "Full error" : "Json schema"}
                                </h2>

                                {this.renderJsonSchema()}

                            </span>

                        </div>
                    </div>
                </div>
            );

        else return <span />
    }

    renderSample() {
        return (
            <span>

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
                        copyData={this.jsonSample} />

                    Copy to clipboard <span className="glyphicon glyphicon-copy"></span>

                </button>

                <span hidden={!this.sampleIsOpen}>

                    <div className="clearfix" />

                    <pre ref={ref => { this.jsonSampleElem = ref; }}>
                        {/* Since errors have some HTML formatted elements: */}
                        <code id="sample-json" dangerouslySetInnerHTML={{ __html: this.jsonSample }} />
                    </pre>

                </span>

            </span>);
    }

    renderJsonSchema() {
        return (
            <span>

                <button
                    style={{
                        display: "inline",
                        marginTop: "20px"
                    }}
                    className="action btn-copy"
                    id="copy-json-schema"
                    onClick={e => this.copyJsonSchemaToClipboard.copyToClipboard()}>

                    <CopyToClipboardComponent
                        ref={ref => this.copyJsonSchemaToClipboard = ref}
                        copyData={this.jsonSchema} />

                    Copy to clipboard <span className="glyphicon glyphicon-copy"></span>

                </button>

                <span hidden={!this.jsonSchemaIsOpen}>

                    <div className="clearfix" />

                    <pre ref={ref => { this.jsonSchemaElem = ref; }}>
                        {/* Since errors have some HTML formatted elements: */}
                        <code id="json-schema-json" dangerouslySetInnerHTML={{ __html: this.jsonSchema }} />
                    </pre>

                </span>

            </span>);
    }

    goToSample() {
        this.sampleIsOpen = true;
        this.forceUpdate();
        setTimeout(() => this.sampleHeader.scrollIntoView(true), 1);
    }

    goToJsonSchema() {
        this.jsonSchemaIsOpen = true;
        this.forceUpdate();

        setTimeout(() => this.jsonSchemaHeader.scrollIntoView(true), 1);
    }

    toggleJsonSchemaFolded() {
        this.jsonSchemaIsOpen = !this.jsonSchemaIsOpen;
        this.forceUpdate();
    }

    toggleSampleFolded() {
        this.sampleIsOpen = !this.sampleIsOpen;
        this.forceUpdate();
    }

    openModal() {
        this.setOpenState();
        this.forceUpdate();

        if (!this.colorized) {
            hljs.highlightBlock(this.jsonSchemaElem);
            hljs.highlightBlock(this.jsonSampleElem);

            this.colorized = true;
        }

        /**
         * Only works when frontend is loaded with bootstrap / jquery
         */
        if ($)
            // @ts-ignore 
            $(this.modal).modal();
    }

    closeModal() {
        if ($)
            // @ts-ignore
            $(this.modal).modal("hide");
    }

}