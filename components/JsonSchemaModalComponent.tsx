import hljs from "highlight.js";
import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../stores/StoreContext";
import ViewUtils from "../utils/ViewUtils";
import CopyToClipboardComponent from "./copy/CopyToClipboard";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { ActionButton } from "../theme/Buttons";
import ClearFix from "./ClearFix";
import Icon, { ICON_COLOR } from "./Icon";
import { ICON } from "../constants";
import { useScript } from "../utils/hooks";

hljs.configure({ languages: ["json"] });

// TODO: add links to tabs

function getTabFromHash() {
	try {
		const decodedURIHash = decodeURI(window.location.hash);
		const windowLocationTab = Number.parseInt(decodedURIHash.substring(decodedURIHash.length - 1));

		return windowLocationTab || 0;
	} catch (err) {
		return 0;
	}
}

function cssFriendlify(string) {
	if (!string)
		return string;

	return string
		.split("/").join("")
		.split("#").join("")
		.split(":").join("")
		.split(".").join("")
		.split("+").join("");
}

interface Props {
	schema: any;
	endpointUrl: string;
	hidden?: boolean;
	isError?: boolean;
	isOpenedFromErrorsMenu?: boolean;
	modalOpen: boolean;
	onClose: () => any;
}

const JsonSchemaModalComponent = ({ schema, isError = false, endpointUrl, hidden = false, isOpenedFromErrorsMenu = false, modalOpen, onClose }: Props) => {
	const status = useScript("./node-docson.min.js");

	let jsonSchemaElem: React.MutableRefObject<any> = useRef(null);
	let jsonSampleElem: React.MutableRefObject<any> = useRef(null);
	let copyJsonSampleToClipboard: CopyToClipboardComponent | null;
	let copyJsonSchemaToClipboard: CopyToClipboardComponent | null;
	const docsonContainer = useRef(null);

	const schemaToJson = Object.assign({}, schema);
	const jsonSample = schemaToJson && schemaToJson.sample ? JSON.stringify(ViewUtils.sortObject(schemaToJson.sample), null, 4) : undefined;

	if (!isError)
		delete schemaToJson.sample;

	const jsonSchema = JSON.stringify(ViewUtils.sortObject(schemaToJson), null, 4);
	const { uiStore } = useStore();
	const [currentModalTabIndex, setCurrentModalTabIndex] = useState(uiStore.currentModalTabIndex);

	useEffect(() => openModal(), [modalOpen]);

	const [docsonified, setDocsonified] = useState(false);

	// @ts-ignore
	if (process.browser)
		useEffect(() => {
			// @ts-ignore
			if (!isError && window.nodeDocson && modalOpen && !docsonified) {
				setDocsonified(true);
				// @ts-ignore
				const docson = window.nodeDocson();
				docson.doc(ViewUtils.sortObject(schemaToJson), `docson-${cssFriendlify(endpointUrl)}-${schema.id}`);
			}
			// @ts-ignore
		}, [window.nodeDocson, docsonContainer.current, status]);

	const resetModalHash = () => {
		if (!hidden && (!isError || !isOpenedFromErrorsMenu))
			history.replaceState(undefined, undefined, `#${endpointUrl}`);
		else
			history.replaceState(undefined, undefined, `#`);

		onClose();
	}

	const closeModal = () => {
		resetModalHash();
	};

	const setInitialOpenState = () => {
		const hashIndex = getTabFromHash();
		uiStore.currentModalTabIndex = hashIndex;

		if (isError)
			goToTab(1);
		else
			goToTab(hashIndex);
	};

	const openModal = () => {
		if (!modalOpen)
			return;

		if (hidden)
			return;

		try {
			setInitialOpenState();

			hljs.highlightBlock(jsonSchemaElem.current);
			hljs.highlightBlock(jsonSampleElem.current);

			if (!isOpenedFromErrorsMenu)
				history.replaceState(undefined, undefined, `#${endpointUrl}?modal=${schema.id}&tab=${currentModalTabIndex}`);

			const schemaToJson = ViewUtils.sortObject(Object.assign({}, schema));
			delete schemaToJson.sample;
		} catch (err) {
			console.warn(err);
		}
	}

	const goToTab = (index) => {
		uiStore.currentModalTabIndex = index;
		setCurrentModalTabIndex(index);

		if (!isOpenedFromErrorsMenu)
			window.history.replaceState(undefined, undefined, `#${endpointUrl}?modal=${schema.id}&tab=${index}`);
	}

	const renderSample = () => {
		if (!jsonSample)
			return <span />;

		return (
			<React.Fragment>

				<ActionButton
					margin={"20px 0 0 0"}
					className="btn-copy"
					id="copy-sample"
					onClick={() => copyJsonSampleToClipboard.copyToClipboard()}>

					<CopyToClipboardComponent
						ref={ref => copyJsonSampleToClipboard = ref}
						copyData={jsonSample} />

					Copy to clipboard <Icon type={ICON.COPY} />

				</ActionButton>

				<ClearFix />

				<pre
					ref={jsonSampleElem}>
					{/* Since errors have some HTML formatted elements: */}
					<code
						id="sample-json"
						dangerouslySetInnerHTML={{ __html: jsonSample }} />
				</pre>

			</React.Fragment>
		);
	}

	const renderJsonSchema = () => {
		if (!jsonSchema)
			return <span />;

		return (
			<React.Fragment>
				<ActionButton
					margin={"20px 0 0 0"}
					className="btn-copy"
					id="copy-json-schema"
					onClick={() => copyJsonSchemaToClipboard.copyToClipboard()}>

					<CopyToClipboardComponent
						ref={ref => copyJsonSchemaToClipboard = ref}
						copyData={jsonSchema} />

					Copy to clipboard <Icon type={ICON.COPY} />

				</ActionButton>

				{jsonSchema.length > 0 ?
					<React.Fragment>

						<ClearFix />

						<pre
							ref={jsonSchemaElem}>
							{/* Since errors have some HTML formatted elements: */}
							<code
								id="json-schema-json"
								dangerouslySetInnerHTML={{ __html: jsonSchema }} />
						</pre>

					</React.Fragment> : "No further details available."}

			</React.Fragment>
		);
	}

	if (schema)
		return (
			<>
				<Modal
					size="lg"
					aria-labelledby="contained-modal-title-vcenter"
					centered={true}
					backdropClassName="modal-backdrop"
					show={modalOpen}
					animation={false}
					onHide={() => closeModal()}
					style={{ opacity: 1 }}>
					<Icon
						type={ICON.CLOSE}
						color={ICON_COLOR.MENU_OPEN}
						id="close-btn"
						onClick={() => closeModal()}
					/>

					<Modal.Body>
						<h1 id="header">{schema.id}</h1>
						<p>{isError ? "Contains errors" : schema ? schema.description : ""}</p>
						<br />

						{isError ?
							<ul className="nav nav-tabs">
								<li className="nav-item clickable">
									<a className={`nav-link ${currentModalTabIndex === 1 ? "active" : ""}`} onClick={() => goToTab(1)}>Error message</a>
								</li>
								<li className="nav-item clickable">
									<a className={`nav-link ${currentModalTabIndex === 2 ? "active" : ""}`} onClick={() => goToTab(2)}>Full error & Json Schema</a>
								</li>
							</ul>
							:
							<ul className="nav nav-tabs">
								<li className="nav-item clickable">
									<a className={`nav-link ${currentModalTabIndex === 0 ? "active" : ""}`} onClick={() => goToTab(0)}>Definition</a>
								</li>
								<li className="nav-item clickable">
									<a className={`nav-link ${currentModalTabIndex === 1 ? "active" : ""}`} onClick={() => goToTab(1)}>Sample</a>
								</li>
								<li className="nav-item clickable">
									<a className={`nav-link ${currentModalTabIndex === 2 ? "active" : ""}`} onClick={() => goToTab(2)}>Json schema</a>
								</li>
							</ul>
						}

						<div id={`docson-${cssFriendlify(endpointUrl)}-${schema.id}`}
							ref={docsonContainer}
							className="docson-entry"
							hidden={currentModalTabIndex !== 0} >
							<br />
							{status !== "ready" ? "Loading..." : ""}
						</div>

						<span className="modal-container"
							hidden={currentModalTabIndex !== 1}>
							{renderSample()}
						</span>

						<span className="modal-container"
							hidden={currentModalTabIndex !== 2}>
							{renderJsonSchema()}
						</span>

					</Modal.Body>
					<Modal.Footer>
						<Button variant="default" onClick={() => closeModal()}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>
			</>
		);
};

export default JsonSchemaModalComponent;
