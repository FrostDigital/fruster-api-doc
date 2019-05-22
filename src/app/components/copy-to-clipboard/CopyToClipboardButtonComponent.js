import React from "react";
import CopyToClipboardComponent from "./CopyToClipboardComponent";

export default class CopyToClipboardButtonComponent extends React.Component {

    render() {
        return (
            <button
                title={`Copy ${this.props.copyDescription ? this.props.copyDescription + " " : ""}to clipboard`}
                className="action btn-copy"
                onClick={() => this.copy()}>

                <CopyToClipboardComponent
                    ref={ref => this.copyToClipboard = ref}
                    copyData={this.props.copyData} />

                <span className="glyphicon glyphicon-copy"></span>
            </button>
        );
    }

    copy() {
        this.copyToClipboard.copyToClipboard();
    }

}
