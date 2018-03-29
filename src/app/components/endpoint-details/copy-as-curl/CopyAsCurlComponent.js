import React from "react";


export default class CopyAsCurlComponent extends React.Component {

    render() {
        return (
            <span hidden={!this.props.cUrl}>
                <button
                    className="action copy-as-curl btn-copy"
                    onClick={(e) => this.copyAsCurl()}>

                    <input
                        type="text"
                        className="curl-data"
                        ref={ref => { this.input = ref; }}
                        value={this.props.cUrl} hidden />

                    Copy as cUrl <span className="glyphicon glyphicon-copy"></span>
                </button>

                <div className="clearfix" />
            </span>
        );
    }

    async copyAsCurl() {
        this.input.hidden = false;
        this.input.select();
        document.execCommand("copy");
        this.input.hidden = true;
    }

}