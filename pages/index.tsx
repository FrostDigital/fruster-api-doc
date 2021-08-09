import { observer } from "mobx-react";
import React, { useEffect, useMemo } from "react";
import FetchClient from "../clients/FetchClient";
import ClearFix from "../components/ClearFix";
import EndpointContainer from "../components/EndpointContainer";
import EndpointsTableOfContentsComponent from "../components/EndpointsTableOfContentsComponent";
import ErrorMessageComponent from "../components/ErrorMessageComponent";
import ToolbarComponent from "../components/ToolbarComponent";
import { NIGHTMODE_COOKIE_NAME } from "../constants/constants";
import { ENDPOINT_TYPE } from "../models/Endpoint";
import { SubjectObject } from "../stores/EndpointStore";
import { useStore } from "../stores/StoreContext";
import { FILTER_TYPE } from "../stores/ToolStore";
import { filterByDocs, filterByPermissions, filterByService, filterBySubject } from "../utils/filter-utils";
import { reactToHashChange } from "../utils/hash-utils";
import NextPropsMiddleware from "../utils/NextPropsMiddleware";
import ViewUtils from "../utils/ViewUtils";
import { PORT, apiRoot, projectName, colorCodedWords } from "../config";
import Head from "next/head";

const Index = ({ lastCachedDate }) => {
	const { filterStore, toolStore, uiStore, endpointStore, configStore } = useStore();
	const { projectName } = configStore.config;

	useEffect(() => {
		if (toolStore.filter !== "") {
			let filterFunction: Function;

			switch (toolStore.filterBy) {
				case FILTER_TYPE.DOCS:
					filterFunction = filterByDocs;
					break;
				case FILTER_TYPE.PERMISSIONS:
					filterFunction = filterByPermissions
					break;
				case FILTER_TYPE.SERVICE:
					filterFunction = filterByService;
					break;
				case FILTER_TYPE.SUBJECT:
					filterFunction = filterBySubject;
					break;
			}

			const value = new String(toolStore.filter)
				.toLowerCase().split("/").join(".");
			const valueArray = value.split(" ");

			filterStore.filterEndpointsBy(valueArray, filterFunction);

			// document.getElementById("api-doc-title").scrollIntoView();
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;

			history.replaceState(undefined, undefined, `#`);
		}
	}, [toolStore.filter, toolStore.filterBy]);

	/**
	 * Renders the details for all endpoints within a category (http, service & ws).
	 *
	* @param {String } type
	*/
	const listEndpointDetails = (type: ENDPOINT_TYPE) => {
		let subjectsByGroup: { [x: string]: SubjectObject[] };

		if (type === ENDPOINT_TYPE.HTTP)
			subjectsByGroup = endpointStore.httpSubjectsByGroup;
		if (type === ENDPOINT_TYPE.SERVICE)
			subjectsByGroup = endpointStore.serviceSubjectsByGroup;
		if (type === ENDPOINT_TYPE.WS)
			subjectsByGroup = endpointStore.wsSubjectsByGroup;

		if (!subjectsByGroup || subjectsByGroup && Object.keys(subjectsByGroup).length === 0)
			return "No endpoints";

		const elems = ViewUtils
			.sortedForEach(subjectsByGroup, (subjects, group) => {
				return (
					<EndpointContainer
						key={`${group}`}
						group={group}
						type={type}
						subjectObjs={subjects} />
				);
			})
			.filter(elem => !!elem);

		if (Object.keys(subjectsByGroup).map(group => {
			let visibleEndpoints = false;

			for (let i = 0; i < subjectsByGroup[group].length; i++) {
				if (!subjectsByGroup[group][i].hidden) {
					visibleEndpoints = true;
					break;
				}
			}

			if (visibleEndpoints)
				return group;
			else
				return null;
		}).filter(i => !!i).length === 0)
			return <>No endpoints</>;

		return elems;
	}

	const resetFilter = () => {
		toolStore.resetFilter();
		filterStore.resetFilteredEndpoints();
		history.replaceState(undefined, undefined, `#`);
	};

	useEffect(() => {
		if (window.location.hash !== "")
			window.addEventListener("hashchange", () => {
				handleHashChange();
			}, false);

		handleHashChange();

		function handleHashChange() {
			reactToHashChange(toolStore, uiStore);
		}

		return function cleanup() {
			window.removeEventListener("hashchange", handleHashChange, false);
		}
	}, [false]);

	return (
		<>
			<Head>
				<title>{projectName ? (projectName + " ") : ""}API documentation</title>
			</Head>

			<div
				className={`container`}
				title="content container"
			>
				<ErrorMessageComponent />

				<a href="#">
					<h1 id="api-doc-title">{projectName ? projectName + " " : ""}API</h1>
				</a>

				<p style={{ fontSize: "12px" }}>Documentation was generated on {!!lastCachedDate ? lastCachedDate : "n/a"}</p>

				<h4>Table of contents {
					!!toolStore.filter.length &&
					<span style={{ marginLeft: "15px", color: "#ff6969", display: "inline", fontSize: "14px" }}>
						<b>Note: </b><i>Showing filtered result by <b>"{toolStore.filter}"</b></i>.&nbsp;
						<a
							className="clickable"
							title="Reset filter (R)"
							onClick={resetFilter}>Reset</a>
					</span>
				}</h4>

				<div className="row table-of-contents">

					<EndpointsTableOfContentsComponent subjectObjects={endpointStore.httpSubjectsByGroup} type={ENDPOINT_TYPE.HTTP} />
					<EndpointsTableOfContentsComponent subjectObjects={endpointStore.serviceSubjectsByGroup} type={ENDPOINT_TYPE.SERVICE} />
					<EndpointsTableOfContentsComponent subjectObjects={endpointStore.wsSubjectsByGroup} type={ENDPOINT_TYPE.WS} />

				</div>

				<ClearFix />

				<>
					<a href="#http-endpoints">
						<h1 id="http-endpoints">Http endpoints</h1>
					</a>
					{listEndpointDetails(ENDPOINT_TYPE.HTTP)}
				</>

				<>
					<a href="#ws-endpoints">
						<h1 id="ws-endpoints">Ws endpoints</h1>
					</a>
					{listEndpointDetails(ENDPOINT_TYPE.WS)}
				</>

				<>
					<a href="#service-endpoints">
						<h1 id="service-endpoints">Service endpoints</h1>
					</a>
					{listEndpointDetails(ENDPOINT_TYPE.SERVICE)}
				</>

			</div>

			<br />

			<ToolbarComponent />
		</>
	);
};

export default observer(Index);

export const getServerSideProps = NextPropsMiddleware(async ({ req, res }, { endpointStore, toolStore, configStore }) => {
	configStore.config = { PORT, apiRoot, projectName, colorCodedWords };

	const fetchClient = new FetchClient({
		apiRoot: "http://localhost:" + PORT
	});

	const { endpointsByType, lastCachedDate, schemasWithErrors } = await fetchClient.get({ path: "/state" });
	const nightmode = !!req.cookies[NIGHTMODE_COOKIE_NAME];

	const allEndpointsData = [];
	let httpSubjectsByGroup = {};
	let serviceSubjectsByGroup = {};
	let wsSubjectsByGroup = {};

	if (endpointsByType.http) {
		const { allEndpoints, subjectsByGroup } = getSubjectsByGroup(endpointsByType.http, "http");
		httpSubjectsByGroup = subjectsByGroup;
		allEndpointsData.push(...allEndpoints);
	}

	if (endpointsByType.service) {
		const { allEndpoints, subjectsByGroup } = getSubjectsByGroup(endpointsByType.service, "service");
		serviceSubjectsByGroup = subjectsByGroup;
		allEndpointsData.push(...allEndpoints);
	}

	if (endpointsByType.ws) {
		const { allEndpoints, subjectsByGroup } = getSubjectsByGroup(endpointsByType.ws, "ws");
		wsSubjectsByGroup = subjectsByGroup;
		allEndpointsData.push(...allEndpoints);
	}

	endpointStore.endpoints = allEndpointsData;
	endpointStore.httpSubjectsByGroup = httpSubjectsByGroup;
	endpointStore.serviceSubjectsByGroup = serviceSubjectsByGroup;
	endpointStore.wsSubjectsByGroup = wsSubjectsByGroup;
	endpointStore.schemasWithErrors = schemasWithErrors;

	toolStore.nightmode = nightmode;

	res.setHeader("Cache-Control", "public, max-age=" + 5000);

	return {
		props: { lastCachedDate: (new Date(lastCachedDate || new Date())).toJSON(), nightmode }
	};
});

function getSubjectsByGroup(groupsObj: any, type: string) {
	const allEndpoints = [];
	const subjectsByGroup = {};

	try {
		Object.keys(groupsObj).forEach(group => {
			subjectsByGroup[group] = [];

			try {
				groupsObj[group].forEach(endpoint => {
					allEndpoints.push({ ...endpoint, group });
					subjectsByGroup[group].push({ group, subject: endpoint.subject, serviceName: endpoint.serviceName, hidden: false, type });
				});
			} catch (err) {
				console.error("2", err);
			}
		});
	} catch (err) {
		console.error("1", err);
	}

	return {
		allEndpoints,
		subjectsByGroup
	};
}
