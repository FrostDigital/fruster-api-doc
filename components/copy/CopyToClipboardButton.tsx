import React from "react";
import { ActionButton } from "../../theme/Buttons";
import Icon from "../Icon";
import CopyToClipboard from "./CopyToClipboard";

const CopyToClipboardButton = ({ copyDescription, copyData }) => {
	let copyToClipboard: CopyToClipboard;

	return (
		<ActionButton
			title={`Copy ${copyDescription ? copyDescription + " " : ""}to clipboard`}
			className="btn-copy"
			onClick={() => copyToClipboard.copyToClipboard()}>

			<CopyToClipboard
				ref={ref => copyToClipboard = ref}
				copyData={copyData} />

			<Icon type="copy" />
		</ActionButton>
	);
};

export default CopyToClipboardButton;
