import React from "react";
import CopyToClipboardComponent from "../../copy-to-clipboard/CopyToClipboardComponent";

export default class CopyAsCurlComponent extends React.Component {

    render() {
        const { cUrl = false } = this.props;

        if (!cUrl)
            return <React.Fragment />;

        return (
            <React.Fragment>
                <button
                    className="action copy-as-curl btn-copy"
                    onClick={() => this.copyAsCurl()}>

                    <CopyToClipboardComponent
                        ref={ref => this.copyToClipboard = ref}
                        copyData={cUrl} />

                    Copy as cUrl <span className="glyphicon glyphicon-copy"></span>
                </button>

                <div className="clearfix" />
            </React.Fragment>
        );
    }

    copyAsCurl() {
        this.copyToClipboard.copyToClipboard();
    }

    shouldComponentUpdate() {
        return false;
    }

}
