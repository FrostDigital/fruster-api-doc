import React from "react";
import CopyToClipboardComponent from "../../copy-to-clipboard/CopyToClipboardComponent";

export default class CopyAsCurlComponent extends React.Component {

    render() {
        return (
            <span hidden={!this.props.cUrl}>
                <button
                    className="action copy-as-curl btn-copy"
                    onClick={(e) => this.copyAsCurl()}>

                    <CopyToClipboardComponent
                        ref={ref => this.copyToClipboard = ref}
                        copyData={this.props.cUrl} />

                    Copy as cUrl <span className="glyphicon glyphicon-copy"></span>
                </button>

                <div className="clearfix" />
            </span>
        );
    }

    copyAsCurl() {
        this.copyToClipboard.copyToClipboard();
    }

}