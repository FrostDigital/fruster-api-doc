import styled from "styled-components";

interface ActionButtonProps {
	margin: string | number;
}

export const ActionButton = styled.button<ActionButtonProps>`
	border: none;
	color: #337ab7 !important;
	background: none;
	margin: ${props => props.margin ?? "none"};

	&:hover {
		text-decoration: underline;
		color: #23527c;
	}

	&[disabled]{
		border: none;
		color: #878787 !important;
		background: none;
	}
`;
