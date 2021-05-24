import React from "react";
import { ICON } from "../constants";
import { ActionButton } from "../theme/Buttons";
import ClearFix from "./ClearFix";
import CopyToClipboard from "./copy/CopyToClipboard";
import Icon from "./Icon";

interface Props {
	cUrl: string;
}

const CopyAsCurlComponent = ({ cUrl }: Props) => {
	let copyToClipboard: CopyToClipboard;

	if (!cUrl)
		return null;

	return (
		<>
			<ActionButton
				className="btn-copy"
				onClick={() => copyToClipboard.copyToClipboard()}>

				<CopyToClipboard
					ref={ref => copyToClipboard = ref}
					copyData={cUrl} />

				Copy as cUrl <Icon type={ICON.COPY} />
			</ActionButton>

			<ClearFix />
		</>
	);
};


export default CopyAsCurlComponent;
