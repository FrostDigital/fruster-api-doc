import React from "react";

export default class CopyToClipboard extends React.Component<any>{

	private input: HTMLTextAreaElement;

	render() {
		return (
			<textarea
				ref={ref => { this.input = ref; }}
				onChange={() => { }}
				value={this.props.copyData}
				hidden
			/>
		);
	}

	copyToClipboard() {
		this.input.hidden = false;
		this.input.select();
		document.execCommand("copy");
		this.input.hidden = true;
	}

	shouldComponentUpdate() { return false; }

}
