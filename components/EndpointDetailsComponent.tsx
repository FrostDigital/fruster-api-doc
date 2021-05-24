import ReactMarkdown from "react-markdown";
import { observer } from "mobx-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiRoot } from "../config";
import { useStore } from "../stores/StoreContext";
import { SCHEMA_TYPE } from "../stores/UIStore";
import ViewUtils from "../utils/ViewUtils";
import CopyToClipboardButton from "./copy/CopyToClipboardButton";
import CopyAsCurlComponent from "./CopyAsCurlComponent";
import JsonSchemaModalComponent from "./JsonSchemaModalComponent";
import markdownToTxt from "markdown-to-txt";
import { reactToHashChange } from "../utils/hash-utils";
import Icon, { ICON_COLOR } from "./Icon";
import { ICON } from "../constants";

interface Props {
	subject: string;
	serviceName: string;
	type: string;
	checked?: boolean;
	onCheck?: (a: any) => any;
	schemas: any[];
	hidden: boolean;
}

const EndpointDetailsComponent = ({ subject, schemas, type, checked, onCheck, serviceName, hidden }: Props) => {
	const markup = useRef(null);

	const { uiStore, endpointStore, toolStore } = useStore();
	const allEndpoints = endpointStore.allEndpoints;
	const endpoint = endpointStore.getEndpointBySubject(serviceName, subject);

	let urlSubjectLink: string;
	let urlSubject;

	const parsedSubject = useMemo(() => ViewUtils.parseSubjectToAPIUrl(endpoint.subject), [false]);
	const isPubEndpoint = endpoint.subject.substring(0, 3) === "pub";
	const requestSchema = useMemo(() => schemas.find(schema => schema.id === endpoint.requestSchema), [false]);
	const responseSchema = useMemo(() => schemas.find(schema => schema.id === endpoint.responseSchema), [false]);

	if (type === "http") {
		const parsedSubjectUrl = useMemo(() => ViewUtils.getStyledUrlParamUrl(parsedSubject.url), [false]);

		urlSubject = useMemo(() => <><span className={parsedSubject.method}>{parsedSubject.method}</span> to {parsedSubjectUrl}</>, [false]);
		urlSubjectLink = useMemo(() => `${parsedSubject.method}-to-${parsedSubject.url}`, [false]);
	} else {
		urlSubject = useMemo(() => ViewUtils.getColorCodedTitle(ViewUtils.getStyledUrlParamUrlString(endpoint.subject, ".")), [false]);
		urlSubjectLink = useMemo(() => isPubEndpoint ? `${endpoint.serviceName}+${endpoint.subject}` : endpoint.subject, [false]);
	}

	const endpointOpenId = useMemo(() => isPubEndpoint ? `${endpoint.serviceName}+${endpoint.subject}` : urlSubjectLink, [false]);
	const isOpen = uiStore.isOpen(endpointOpenId);
	const openSchema = uiStore.getOpenSchemaForEndpoint(urlSubjectLink);
	const [selected, setSelected] = useState(false);
	const [silentOpen, setSilentOpen] = useState(false);
	const [requestSchemaModalOpen, setRequestSchemaModalOpen] = useState(requestSchema && openSchema === requestSchema.id);
	const [responseSchemaModalOpen, setResponseSchemaModalOpen] = useState(responseSchema && openSchema === responseSchema.id);

	const toggleFolded = () => {
		if (window.location.hash === "#" + urlSubjectLink)
			history.replaceState(undefined, undefined, `#`);

		setSilentOpen(true);
		uiStore.toggleOpen(endpointOpenId);
	};

	const open = () => {
		setSilentOpen(false);
		uiStore.open(endpointOpenId);
	};

	useEffect(() => {
		if (isOpen && !silentOpen) {
			setSelected(true);

			setTimeout(() => setSelected(false), 100);

			if (markup.current)
				markup.current.scrollIntoView(true);
		}
	}, [isOpen]);

	useEffect(() => {
		if (requestSchema)
			setRequestSchemaModalOpen(openSchema === requestSchema.id);

		if (responseSchema)
			setResponseSchemaModalOpen(openSchema === responseSchema.id);
	}, [openSchema]);

	/**
	 * Returns note for special case endpoints
	 * For instance a styled and "linkified" deprecation note
	 */
	const getInformationNote = () => {
		const { deprecated, pending } = endpoint;

		if (!deprecated && !pending)
			return;

		const getNote = () => {
			if (deprecated && typeof deprecated === "string") {
				const html = getDeprecatedHtml(deprecated);

				return (
					<span className="deprecated-note" >
						{html.map((o: any, i: number) => <span key={i}>{o}</span>)}
					</span>
				);
			} else if (pending)
				return (<>This endpoint is not yet implemented!</>);
		}

		return (
			<>
				| <span className="deprecated-description">Note: </span>
				{getNote()}
			</>
		);
	}

	/**
	 * Adds links to endpoints referenced in the deprecated text.
	 */
	const getDeprecatedHtml = (description: string) => {
		const parts = description.split(" ");
		const partsWithEndpoint = {};

		let endpointsExists = false;

		for (let i = 0; i < parts.length; i++) {
			let partToCompare = parts[i];
			let partHasDot = false;

			if (partToCompare[partToCompare.length - 1] === ".") {
				partToCompare = partToCompare.substring(0, partToCompare.length - 1);
				partHasDot = true;
			}

			if (allEndpoints.includes(partToCompare)) {
				endpointsExists = true;
				parts[i] = partToCompare;

				partsWithEndpoint[parts[i]] = parts[i];

				if (partHasDot)
					parts.splice(i + 1, 0, ".");
			}
		}

		if (!endpointsExists)
			return [" " + description];

		Object.keys(partsWithEndpoint).
			forEach(key => {
				const onClick = () => setTimeout(() => reactToHashChange(toolStore, uiStore), 200);

				if (key.includes("http")) {
					const parsedHttpEndpoint = ViewUtils.parseSubjectToAPIUrl(key);
					const endpointId = `#${parsedHttpEndpoint.method}-to-${parsedHttpEndpoint.url}`;

					partsWithEndpoint[key] =
						<>
							&nbsp;
							<a key={key} href={endpointId} onClick={onClick}>
								<span className={`${parsedHttpEndpoint.method}`}>{parsedHttpEndpoint.method}</span> to {parsedHttpEndpoint.url}
							</a>
							&nbsp;
						</>
				} else
					partsWithEndpoint[key] = <>&nbsp;<a href={`#${key}`} onClick={onClick} >{ViewUtils.getColorCodedTitle(key)}</a>&nbsp;</>;
			});

		const output = [];

		parts.forEach(pt => {
			if (partsWithEndpoint[pt])
				output.push(partsWithEndpoint[pt]);
			else
				output.push(pt);
		});

		return output;
	}

	/**
	 * Prepares the endpoint details table.
	 */
	const getEndpointDetailsTable = () => {
		const { subject, serviceName, requestSchema, responseSchema, permissions, mustBeLoggedIn } = endpoint;

		return (
			<table
				className="table table">

				<thead>
					<tr>
						<th>Subject</th>
						<th>Request body</th>
						<th>Required permissions</th>
					</tr>
				</thead>

				<tbody>
					<tr>
						{/* Subject */}
						<td>
							{subject}
							<CopyToClipboardButton
								copyData={subject}
								copyDescription="subject" />
						</td>
						{/* Request body */}
						<td
							onClick={e => openBodyModal(e, SCHEMA_TYPE.REQUEST_SCHEMA)}
							className={`request-schema ${serviceName} ${requestSchema} ${(requestSchema ? " " : "deactivated")} ${requestSchema && endpointStore.schemaHasErrors(requestSchema as string) ? "has-error" : ""}`}
						>
							<a
								href={requestSchema ? `#${urlSubjectLink}?modal=${requestSchema}` : "#"}
								className={requestSchema ? "" : "deactivated"}>
								{requestSchema || <span className="not-available"> n/a</span>}
								{requestSchema && <Icon type={ICON.OPEN_IN_MODAL} size={12} margin={"0 0 0 5px"} padding={"13px 0 0 0"} />}
							</a>

							{requestSchema
								&& <CopyToClipboardButton
									copyData={requestSchema}
									copyDescription="request schema name" />}
						</td>
						{/* Required permissions */}
						<td>
							<span
								className="quickfix">{ /** Note: Quickfix: this has to be span to prevent "or", "and" etc to appear because of the copy button */}
								{getPermissions()}
							</span>

							{permissions
								&& permissions.length > 0
								&& <CopyToClipboardButton
									copyData={permissions.join(",")}
									copyDescription="permissions" />}
						</td>
					</tr>
				</tbody>

				<thead>
					<tr>
						<th>Url</th>
						<th>Response body</th>
						<th>Must be logged in</th>
					</tr>
				</thead>

				<tbody>
					<tr>
						{/* Url */}
						<td>{
							type === "http"
								? <>
									<a href={apiRoot + parsedSubject.url} target="_blank">{apiRoot + parsedSubject.url}</a>

									<CopyToClipboardButton
										copyData={apiRoot + parsedSubject.url}
										copyDescription="url" />
								</>
								: <span className="not-available">n/a</span>

						}</td>

						{/* Response body */}
						<td
							onClick={e => openBodyModal(e, SCHEMA_TYPE.RESPONSE_SCHEMA)}
							className={`
                            response-schema
                            ${serviceName}
                            ${responseSchema}
                            ${(responseSchema ? " " : "deactivated")}
                            ${responseSchema && endpointStore.schemaHasErrors(responseSchema as string) ? "has-error" : ""}`}>
							<a
								href={responseSchema ? `#${urlSubjectLink}?modal=${responseSchema}` : "#"}
								className={responseSchema ? "" : "deactivated"}>
								{responseSchema || <span className="not-available">n/a</span>}
								{responseSchema && <Icon type={ICON.OPEN_IN_MODAL} size={12} margin={"0 0 0 5px"} padding={"13px 0 0 0"} />}
							</a>

							{responseSchema
								&& <CopyToClipboardButton
									copyData={responseSchema}
									copyDescription="response schema name" />}
						</td>

						{/* Must be logged in */}
						<td
							className={
								(permissions
									&& permissions.length > 0)
									? true.toString()
									: mustBeLoggedIn.toString()
							}>
							{(permissions
								&& permissions.length > 0)
								? true.toString()
								: mustBeLoggedIn.toString()}
						</td>
					</tr>
				</tbody>

			</table>
		);
	}

	/**
	 * Opens a modal with the request json schema.
	 *
	 * @param {Object} e
	 */
	const openBodyModal = (e, type: SCHEMA_TYPE) => {
		if (hidden || !isOpen)
			return;

		if (e.nativeEvent.which !== 2 // if we mouse click with the middle mouse we want the browser to do its thing
			&& !e.target.className.includes("copy") // if the pressed target has class name "copy", we're hitting the copy to clipboard button
		) {
			e.preventDefault();

			if (type === SCHEMA_TYPE.REQUEST_SCHEMA)
				uiStore.setOpenSchemaForEndpoint(urlSubjectLink, requestSchema.id);
			else if (type === SCHEMA_TYPE.RESPONSE_SCHEMA)
				uiStore.setOpenSchemaForEndpoint(urlSubjectLink, responseSchema.id);
		}
	}

	/**
 * Renders all permissions no matter if a simple array or array in array.
 */
	const getPermissions = () => {
		if (endpoint.permissions) {
			// @ts-ignore
			// TODO: fix error
			return endpoint.permissions.map((permissions, index) => {
				let permissionsHmtl;

				if (permissions instanceof Array)
					permissionsHmtl = permissions.map((permission, index) => {
						return (
							<span
								key={index}
								className="permission">
								{permission}
							</span>
						);
					});
				else
					permissionsHmtl = <span className="permission">{permissions}</span>;

				return (
					<span
						key={index}
						className="permission-group">
						{permissionsHmtl}
					</span>
				);
			});
		} else {
			return (
				<span className="permission-group">
					<span className="permission">none</span>
				</span>
			);
		}
	}

	/**
 * Prepares the description table
 */
	const getDocumentationTable = () => {
		const { docs } = endpoint;

		return (
			<table
				className="table table">

				<tbody>
					<tr>
						<td className="description">
							{docs ?
								<>
									<div className="doc-entry-title">Description</div>
									{docs && docs.description
										? <span className="description-value"><ReactMarkdown>{docs.description}</ReactMarkdown></span>
										: <span className="not-available">n/a</span>}
									<span className="url-params-desc">{docs.params ? getDocEntry(docs.params, "Url parameters") : ""}</span>
									<span className="query-params-desc">{docs.query ? getDocEntry(docs.query, "Query parameters") : ""}</span>
									<span className="errors-desc">{docs.errors ? getDocEntry(docs.errors, "Errors") : ""}</span>
								</> : <span className="not-available">n/a</span>}
						</td>
					</tr>
				</tbody>

			</table>
		);
	}

	/**
	 * Renders documentation entry.
	 *
	 * @param {Object|Array} input
	 * @param {String} title
	 */
	const getDocEntry = (input, title) => {
		if (Object.keys(input).length > 0) {
			return (
				<>
					<div className="doc-entry-title">{title}</div>
					{
						Object.keys(input).map((key, index) => {
							const value = input[key];

							return (
								<span key={index}>
									<div className="description-item">
										<span className="description-key">{key}</span>: <span className="description-value">{value}</span>
									</div>
								</span>
							);
						})
					}
				</>
			)
		}
	}

	const { deprecated, pending, instanceId, cUrl, docs, sourceVersion } = endpoint;

	// if (hidden)
	// 	return null;

	const component = useMemo(() => (
		<>
			<>
				<>
					<span
						className={`endpoint-fold-btn ${isOpen ? "open" : ""}`}
						onClick={toggleFolded}>
						{
							isOpen
								? <Icon type={ICON.MENU_DOWN} padding={"16px 0 0 0"} margin={"0 5px 0 0"} color={ICON_COLOR.MENU_OPEN} className="toggle-fold-btn" />
								: <Icon type={ICON.MENU_RIGHT} padding={"16px 0 0 0"} margin={"0 5px 0 0"} color={ICON_COLOR.MENU} className="toggle-fold-btn" />
						}
					</span>

					<a href={"#" + urlSubjectLink} onClick={() => open()}>
						<h3
							style={{ display: "inline-block" }}
							className={`
									${deprecated ? "deprecated" : ""}
									${pending ? "pending" : ""}`}
						>
							{urlSubject}
						</h3>
					</a>
				</>

				<span className={`endpoint-second-row ${!isOpen && (!docs || !docs.description) ? "no-description" : ""}`} title={sourceVersion}>
					from {instanceId} {getInformationNote()}

					<CopyAsCurlComponent cUrl={cUrl} />

					{type === "service"
						&&
						<div
							className="checkbox-proxy"
							onClick={() => onCheck({ target: { name: subject, checked: !checked } })}
						>
							<input
								type="checkbox"
								name={subject}
								checked={checked}
								onChange={onCheck}
							/>
						</div>
					}

				</span>

			</>

			{
				isOpen ?

					<>

						{getEndpointDetailsTable()}

						{getDocumentationTable()}

					</>

					:
					docs
					&& docs.description
					&&
					(
						<span
							onClick={() => toggleFolded()}
							title={docs ? markdownToTxt(docs.description) : ""}
							className="short-description">
							<ReactMarkdown>{docs.description.substring(0, 250)}</ReactMarkdown>
						</span>
					)
			}
		</>
		// TODO: DOUBLE CHECK THIS (checked) WORKS
	), [isOpen, checked]);

	const modals = <>
		{
			isOpen &&

			<>

				{requestSchema && requestSchemaModalOpen &&
					<JsonSchemaModalComponent
						schema={requestSchema}
						endpointUrl={urlSubjectLink}
						isError={requestSchema ? requestSchema._error : false}
						modalOpen={requestSchemaModalOpen}
						isOpenedFromErrorsMenu={false}
						onClose={() => uiStore.closeSchemaForEndpoint(urlSubjectLink)}
					/>}

				{responseSchema && responseSchemaModalOpen &&
					<JsonSchemaModalComponent
						schema={responseSchema}
						endpointUrl={urlSubjectLink}
						isError={responseSchema ? responseSchema._error : false}
						modalOpen={responseSchemaModalOpen}
						isOpenedFromErrorsMenu={false}
						onClose={() => uiStore.closeSchemaForEndpoint(urlSubjectLink)}
					/>}

			</>
		}
	</>;

	return <>
		<div
			ref={markup}
			id={urlSubjectLink}
			className={`${deprecated ? "deprecated-container" : ""} ${pending ? "pending-container" : ""} container endpoint-container ${selected ? "selected-animated" : ""}`}
		>
			{component}
		</div>
		{modals}

	</>;
};

export default observer(EndpointDetailsComponent);
