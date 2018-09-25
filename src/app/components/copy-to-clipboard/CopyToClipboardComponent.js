import React from "react";

export default class CopyToClipboardComponent extends React.Component {

    render() {
        return (
            <input
                type="text"
                className="curl-data"
                ref={ref => { this.input = ref; }}
                onChange={() => { }}
                value={this.props.copyData} hidden />
        );
    }

    copyToClipboard() {
        this.input.hidden = false;
        this.input.select();
        document.execCommand("copy");
        this.input.hidden = true;
    }

    shouldComponentUpdate() {
        return false;
    }

}