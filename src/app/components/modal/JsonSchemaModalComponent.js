import React from "react";
import CopyToClipboardComponent from "../copy-to-clipboard/CopyToClipboardComponent"
import ScrollToTopComponent from "../scroll-to-top/ScrollToTopComponent"
import hljs from "highlight.js";
import SharedUtils from "../../../utils/SharedUtils";

hljs.configure({ languages: ["json"] });

export default class JsonSchemaModalComponent extends React.Component {

    constructor(props) {
        super(props);

        if (this.props.schema) {
            const schemaToJson = Object.assign({}, this.props.schema);
            delete schemaToJson.sample;

            this.jsonSchema = JSON.stringify(SharedUtils.sortObject(schemaToJson), null, 2);
            this.jsonSample = JSON.stringify(this.props.schema.sample, null, 2);
        }

        this.colorized = false;

        this.modal = {};
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

                            <a hidden={this.props.isError} href={`#schema-${this.props.subject}-${this.props.schema.id}`}>
                                <div>Go to json Schema</div>
                            </a>
                            <a hidden={this.props.isError} href={`#sample-${this.props.subject}-${this.props.schema.id}`}>
                                <div>Go to sample</div>
                            </a>

                            <hr />

                            <h2
                                style={{ display: "inline-block" }}
                                id={`schema-${this.props.subject}-${this.props.schema.id}`}>
                                {this.props.isError ? "Full error" : "Json schema"}
                            </h2>

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

                            <div className="clearfix" />

                            <pre ref={ref => { this.jsonSchemaElem = ref; }}>
                                {/* Since errors have some HTML formatted elements: */}
                                <code id="json-schema-json" dangerouslySetInnerHTML={{ __html: this.jsonSchema }} />
                            </pre>

                            <hr />

                            <h2
                                style={{ display: "inline-block" }}
                                id={`sample-${this.props.subject}-${this.props.schema.id}`}>
                                {this.props.isError ? "Error message" : "Sample"}
                            </h2>

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

                            <div className="clearfix" />

                            <pre ref={ref => { this.jsonSampleElem = ref; }}>
                                {/* Since errors have some HTML formatted elements: */}
                                <code id="sample-json" dangerouslySetInnerHTML={{ __html: this.jsonSample }} />
                            </pre>
                        </div>
                    </div>
                </div>
            );

        else return <span />
    }

    openModal() {
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