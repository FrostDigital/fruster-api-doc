import React from "react";
import { ICON } from "../constants";
import Icon, { ICON_COLOR } from "./Icon";

const ScrollToTopComponent = () => {

	const scrollToTop = () => {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
		history.replaceState(undefined, undefined, `#`);
	}

	return (
		<button
			onClick={e => scrollToTop()}
			type="button"
			title="Scroll to top (T)"
			className="btn btn-xs btn-default icon-btn"
			style={{
				// Due to some extreme bug where the whole button would disappear and then crash if inspected if using css class for this, the css has been moved here.
				background: "none",
				color: "white",
				height: "22px",
				float: "left"
			}}>
			<Icon type={ICON.SCROLL_TO_TOP} size={18} color={ICON_COLOR.TOOL_MENU} />
		</button>
	);
};

export default ScrollToTopComponent;
