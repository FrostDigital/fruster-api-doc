import hljs from "highlight.js";
import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import CopyToClipboardComponent from "../copy-to-clipboard/CopyToClipboardComponent";

hljs.configure({ languages: ["json"] });

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

            console.log(this.state.schema.$docson);
        } else
            this.state.schema = {};
    }

    // @ts-ignore
    state = {
        colorized: false,
        sampleSelected: false,
        jsonSchemaSelected: false,
        jsonSchemaIsOpen: true,
        sampleIsOpen: true,
        modal: {},
        currentTabIndex: 0
    };

    setInitialOpenState() {
        this.setState({
            jsonSchemaIsOpen: true,
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
                                onClick={() => this.closeModal()}>
                            </span>

                            <h1 id="header">{this.state.schema.id}</h1>

                            {/* <a
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
                            </a> */}

                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.currentTabIndex === 0 ? "active" : ""}`} onClick={() => this.goToTab(0)}>Docson</a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.currentTabIndex === 1 ? "active" : ""}`} onClick={() => this.goToTab(1)}>Sample</a>
                                </li>
                                <li className="nav-item">
                                    <a className={`nav-link ${this.state.currentTabIndex === 2 ? "active" : ""}`} onClick={() => this.goToTab(2)}>Json schema</a>
                                </li>
                            </ul>

                            {/* <hr /> */}


                            <div id={`docson-${this.state.schema.id}`} hidden={this.state.currentTabIndex !== 0} />

                            {/* <hr /> */}


                            <span className="modal-container" hidden={this.state.currentTabIndex !== 1}>
                                {/* <span
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
                                </h2> */}

                                {this.renderSample()}

                            </span>


                            {/* <hr /> */}

                            <span className="modal-container" hidden={this.state.currentTabIndex !== 2}>
                                {/* <span
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
                                </h2> */}

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

    async goToSample() {
        this.setState({ sampleIsOpen: true });

        setTimeout(() => this.sampleHeader.scrollIntoView(true), 1);

        await this.setState({ sampleSelected: true });

        setTimeout(() => this.setState({ sampleSelected: false }), 100);
    }

    async goToJsonSchema() {
        this.setState({ jsonSchemaIsOpen: true });

        setTimeout(() => this.jsonSchemaHeader.scrollIntoView(true), 1);

        await this.setState({ jsonSchemaSelected: true });

        setTimeout(() => this.setState({ jsonSchemaSelected: false }), 100);
    }

    toggleJsonSchemaFolded() {
        this.setState({ jsonSchemaIsOpen: !this.state.jsonSchemaIsOpen });
    }

    toggleSampleFolded() {
        this.setState({ sampleIsOpen: !this.state.sampleIsOpen });
    }

    openModal() {
        this.setInitialOpenState();

        const schemaToJson = Object.assign({}, this.state.schema);
        delete schemaToJson.sample;

        /**
         * Only works when frontend is loaded with bootstrap / jquery
         */
        if ($)
            // @ts-ignore 
            $(this.state.modal).modal();
        // TODO: sort keys in schema
        const docson = nodeDocson();
        docson.doc(schemaToJson, `docson-${this.state.schema.id}`);
    }

    closeModal() {
        if ($)
            // @ts-ignore
            $(this.state.modal).modal("hide");
    }

    async goToTab(index) {
        await this.setState({ currentTabIndex: index });

        if (index === 2)
            hljs.highlightBlock(this.state.jsonSchemaElem);

        if (index === 1)
            hljs.highlightBlock(this.state.jsonSampleElem);

        if (index === 0) {
            // const schemaToJson = Object.assign({}, this.state.schema);
            // delete schemaToJson.sample;
            // const docson = nodeDocson();
            // docson.doc(schemaToJson, `docson-${this.state.schema.id}`);
        }
    }

}