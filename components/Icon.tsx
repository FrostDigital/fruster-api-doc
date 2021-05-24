import styled from "styled-components";
import { ICON } from "../constants";

export enum ICON_COLOR {
	LINK = "link",
	MENU = "menu",
	MENU_OPEN = "menu-open",
	TOOL_MENU = "tool-menu",
	TOOL_MENU_OPEN = "tool-menu-open",
	SEVERE = "severe"
}
interface Props {
	type: string;
	color?: ICON_COLOR;
	size?: number;
	onClick?: (event: any) => void;
	id?: string;
	className?: string;
	title?: string;
	margin?: string | number;
	padding?: string | number;
	hidden?: boolean;
	disabled?: boolean;
}

const Icon = ({ type, onClick, id, className, title, margin, padding, color = ICON_COLOR.LINK, size = 15, hidden = false, disabled }: Props) => (
	<StyledIcon
		color={color}
		size={size}
		hidden={hidden}
		disabled={disabled}
		style={{ margin, padding }}
		className={`icon-${type} icon-${color} ` + className}
		id={id}
		onClick={onClick}
		title={title}
	/>
);

export default Icon;

interface StyledProps {
	margin: number | string;
	color: ICON_COLOR;
	size: number;
	hidden: boolean;
}

const colors = {
	[ICON_COLOR.LINK]: "#337ab7",
	[ICON_COLOR.MENU]: "#bbbbbb",
	[ICON_COLOR.MENU_OPEN]: "#555",
	[ICON_COLOR.TOOL_MENU]: "#a2a2a2",
	[ICON_COLOR.TOOL_MENU_OPEN]: "#fff",
	[ICON_COLOR.SEVERE]: "rgb(217, 83, 79)",
	disabled: "#878787"
};

const StyledIcon = styled.span<StyledProps>`
	position: relative;
	top: 1px;
	display: inline-block;
	font-style: normal;
	font-weight: 400;
	line-height: 1;
	mask-size: ${props => `${props.size}px ${props.size}px`};
	mask-repeat: no-repeat;
	width: ${props => props.size}px;
	height:  ${props => props.size}px;

	background-color: ${props => props.color ? colors[props.color] : colors.link};

	${props => props.hidden ? "opacity: 0 !important;" : ""}

	&[disabled] {
		background-color: ${colors.disabled} !important;
	}

	&:hover {
		background-color: ${props => {
		switch (props.color) {
			case ICON_COLOR.LINK:
				break;
			case ICON_COLOR.TOOL_MENU:
			case ICON_COLOR.TOOL_MENU_OPEN:
				return colors[ICON_COLOR.TOOL_MENU_OPEN];
			case ICON_COLOR.SEVERE:
				return colors[ICON_COLOR.SEVERE];
			default:
				return colors[ICON_COLOR.MENU_OPEN];
		}
	}};
		opacity: ${props => {
		switch (props.color) {
			case ICON_COLOR.LINK:
			case ICON_COLOR.TOOL_MENU:
			case ICON_COLOR.TOOL_MENU_OPEN:
				return 1;
			default:
				return 0.75;
		}
	}};
	}

	&.icon-${ICON.COPY} {
		  mask-image: url("/copy.svg");
	}

	&.icon-${ICON.CLOSE} {
		  mask-image: url("/close.svg");
	}

	&.icon-${ICON.DOWNLOAD} {
		  mask-image: url("/download.svg");
	}

	&.icon-${ICON.MENU_DOWN} {
		  mask-image: url("/menu-down.svg");
	}

	&.icon-${ICON.MENU_LEFT} {
		  mask-image: url("/menu-left.svg");
	}

	&.icon-${ICON.MENU_RIGHT} {
		  mask-image: url("/menu-right.svg");
	}

	&.icon-${ICON.REFRESH} {
		  mask-image: url("/refresh.svg");
	}

	&.icon-${ICON.OPEN_IN_MODAL} {
		  mask-image: url("/open-modal.svg");
	}

	&.icon-${ICON.SCROLL_TO_TOP} {
		  mask-image: url("/scroll-top.svg");
	}

	&.icon-${ICON.SUN} {
		  mask-image: url("/sun.svg");
	}

	&.icon-${ICON.MOON} {
		  mask-image: url("/moon.svg");
	}

	&.icon-${ICON.RESET} {
		  mask-image: url("/reset.svg");
	}
`;
