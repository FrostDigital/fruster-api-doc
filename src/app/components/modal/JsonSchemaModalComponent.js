import hljs from "highlight.js";
import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import CopyToClipboardComponent from "../copy-to-clipboard/CopyToClipboardComponent";

hljs.configure({ languages: ["json"] });

export default class JsonSchemaModalComponent extends React.Component {

    constructor(props) {
        super(props);

        if (this.props.schema) {
            this.state = this.state || {};
            this.state.schema = this.props.schema;

            const schemaToJson = Object.assign({}, this.state.schema);
            this.state.jsonSample = schemaToJson ? JSON.stringify(schemaToJson.sample, null, 2) : undefined;
            delete schemaToJson.sample;

            this.state.jsonSchema = JSON.stringify(ViewUtils.sortObject(schemaToJson), null, 2);
        } else
            this.state.schema = {};
    }

    // @ts-ignore
    state = {
        colorized: false,
        sampleSelected: false,
        jsonSchemaSelected: false,
        jsonSchemaIsOpen: false,
        sampleIsOpen: true,
        modal: {}
    };

    setInitialOpenState() {
        this.setState({
            ...this.state,
            jsonSchemaIsOpen: false,
            sampleIsOpen: true
        });
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
                                onClick={e => this.closeModal()}>
                            </span>

                            <h1 id="header">
                                {this.state.schema.id}
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
                                    className={`endpoint-fold-btn ${this.state.sampleIsOpen ? "open" : ""}`}
                                    onClick={() => this.toggleSampleFolded()}>
                                    {this.state.sampleIsOpen ?
                                        <i className="toggle-fold-btn json-schema glyphicon glyphicon-menu-down"></i>
                                        : <i className="toggle-fold-btn json-schema glyphicon glyphicon-menu-right"></i>}
                                </span>
                                <h2
                                    className="clickable"
                                    onClick={() => this.goToSample()}
                                    ref={ref => this.sampleHeader = ref}
                                    style={{ display: "inline-block" }}
                                    id={`sample-${this.props.subject}-${this.state.schema.id}`}>
                                    {this.props.isError ? "Error message" : "Sample"}
                                </h2>

                                {this.renderSample()}

                            </span>

                            <hr />

                            <span className="modal-container">
                                <span
                                    className={`endpoint-fold-btn ${this.state.jsonSchemaIsOpen ? "open" : ""}`}
                                    onClick={() => this.toggleJsonSchemaFolded()}>
                                    {this.state.jsonSchemaIsOpen ?
                                        <i className="toggle-fold-btn json-schema glyphicon glyphicon-menu-down"></i>
                                        : <i className="toggle-fold-btn json-schema glyphicon glyphicon-menu-right"></i>}
                                </span>
                                <h2
                                    className="clickable"
                                    onClick={() => this.goToJsonSchema()}
                                    ref={ref => { this.jsonSchemaHeader = ref; }}
                                    style={{ display: "inline-block" }}
                                    id={`schema-${this.props.subject}-${this.state.schema.id}`}>
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
                        copyData={this.state.jsonSample} />

                    Copy to clipboard <span className="glyphicon glyphicon-copy"></span>

                </button>

                <span hidden={!this.state.sampleIsOpen}>

                    <div className="clearfix" />

                    <pre
                        className={`${this.state.sampleSelected ? "selected-animated" : ""}`}
                        ref={ref => { this.state.jsonSampleElem = ref; }}>
                        {/* Since errors have some HTML formatted elements: */}
                        <code id="sample-json" dangerouslySetInnerHTML={{ __html: this.state.jsonSample }} />
                    </pre>

                </span>

            </span>
        );
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
                    onClick={() => this.copyJsonSchemaToClipboard.copyToClipboard()}>

                    <CopyToClipboardComponent
                        ref={ref => this.copyJsonSchemaToClipboard = ref}
                        copyData={this.state.jsonSchema} />

                    Copy to clipboard <span className="glyphicon glyphicon-copy"></span>

                </button>

                <span hidden={!this.state.jsonSchemaIsOpen}>

                    <div className="clearfix" />

                    <pre
                        className={`${this.state.jsonSchemaSelected ? "selected-animated" : ""}`}
                        ref={ref => { this.state.jsonSchemaElem = ref; }}>
                        {/* Since errors have some HTML formatted elements: */}
                        <code id="json-schema-json" dangerouslySetInnerHTML={{ __html: this.state.jsonSchema }} />
                    </pre>

                </span>

            </span>
        );
    }

    goToSample() {
        this.state.sampleIsOpen = true;
        this.forceUpdate();
        setTimeout(() => this.sampleHeader.scrollIntoView(true), 1);

        this.state.sampleSelected = true;

        setTimeout(() => {
            this.state.sampleSelected = false;
            /** for some reason this.setState doesn't work here 🤔 */
            this.forceUpdate();
        }, 100);
    }

    goToJsonSchema() {
        this.state.jsonSchemaIsOpen = true;
        this.forceUpdate();

        setTimeout(() => this.jsonSchemaHeader.scrollIntoView(true), 1);

        this.state.jsonSchemaSelected = true;

        setTimeout(() => {
            this.state.jsonSchemaSelected = false;
            /** for some reason this.setState doesn't work here  🤔*/
            this.forceUpdate();
        }, 100);
    }

    toggleJsonSchemaFolded() {
        this.setState({
            ...this.state,
            jsonSchemaIsOpen: !this.state.jsonSchemaIsOpen
        });
    }

    toggleSampleFolded() {
        this.setState({
            ...this.state,
            sampleIsOpen: !this.state.sampleIsOpen
        });
    }

    openModal() {
        this.setInitialOpenState();

        if (!this.state.colorized) {
            hljs.highlightBlock(this.state.jsonSchemaElem);
            hljs.highlightBlock(this.state.jsonSampleElem);

            this.setState({
                ...this.state,
                colorized: true
            });
        }

        /**
         * Only works when frontend is loaded with bootstrap / jquery
         */
        if ($)
            // @ts-ignore 
            $(this.state.modal).modal();
    }

    closeModal() {
        if ($)
            // @ts-ignore
            $(this.state.modal).modal("hide");
    }

}