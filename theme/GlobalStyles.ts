import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`

	button.icon-btn {
		border: none;
		outline:none;
	}

    .mt-0 {
        margin-top: 0;
    }

    .mt-1 {
        margin-top: 0.35rem;
    }

    .mt-2 {
        margin-top: 1rem;
    }

    .mt-3 {
        margin-top: 2rem;
    }

    &.small {
        font-size: 0.9rem;
    }

    .center {
        text-align: center;
	}

	.table > thead > tr > th {
		border-bottom:	1px solid #c9cdd140;
	}

	.table > tbody > tr > td, .table > tbody > tr > th, .table > tfoot > tr > td, .table > tfoot > tr > th, .table > thead > tr > td, .table > thead > tr > th {
		border-top: none;
	}

	.modal-dialog {
		transform: none !important;
	}

	.modal-backdrop {
		opacity: 0.4 !important;
	}

	.nightmode .modal-footer {
		border-top: 1px solid #424242;
	}

	.nightmode .modal .btn.btn-default {
		color: #fff;
		background-color: #222529;
		border: 1px solid #fff;
		opacity: 0.8;
	}

	.modal-body {
		padding: 0;
	}

	#close-btn {
		float: right;
	}

	.nightmode .modal-content #close-btn {
		filter: invert();
	}

	.nightmode .checkbox-proxy {
		box-shadow:	inset 0px 0px 9px #0000003d !important;

		&:hover {
			box-shadow: inset 0px 0px 9px #00000070 !important
		}
	}

	.checkbox-proxy {
		width: 50px;
		height: 50px;
		margin-top: -50px;
		/* background-color: #8080800a; */
		float: right;
		padding-top: 15px;
		padding-left: 18px;
		border-radius: 5px;
		box-shadow: inset 0px 0px 9px #0000000a;

		&:hover {
			box-shadow: inset 0px 0px 9px #00000021;
		}
	}

	.service-btn input[type="checkbox"] {
		vertical-align: top;
	}

	td .btn-copy {
		opacity: 0;
	}

	td:hover .btn-copy {
		opacity: 1;
	}

	.btn-copy {
		float: right;
	}

	.clearfix {
		clear: both;
	}

	.half-opacity {
		opacity: 0.5 !important;
	}

	input, select, option {
		border: none !important;
	}

	.true {
		color: #6d9f33;
		/* font-weight: bold; */
	}

	.false {
		color: #f34e4b;
		/* font-weight: bold; */
	}

	.GET, .GET * {
		color: #786bc2;
	}

	.POST, .POST * {
		color: #6d9f33;
	}

	.DELETE, .DELETE * {
		color: #f34e4b;
	}

	.PUT, .PUT * {
		color: #e9982f;
	}

	.PUB, .PUB * {
		color: #333;
	}

	.FRUSTER, .FRUSTER * {
		color: #465c6e;
	}

	.nightmode .POST {
		color: #5d872b;
	}

	.nightmode .PUT {
		color: #b07323;
	}

	.nightmode .GET {
		color: #665ba5;
	}

	.nightmode .DELETE {
		color: #c23e3c !important;
	}

	.nightmode .PUB {
		color: #b5b5b5;
	}

	.nightmode .FRUSTER {
		color: #5d7b94;
	}
`;
