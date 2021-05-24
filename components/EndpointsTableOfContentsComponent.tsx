import { observer } from "mobx-react";
import React, { useMemo, useState } from "react";
import { useStore } from "../stores/StoreContext";
import ViewUtils, { ParsedSubject } from "../utils/ViewUtils";
import { SubjectObject } from "../stores/EndpointStore";
import { ENDPOINT_TYPE } from "../models/Endpoint";

interface Props {
	type: ENDPOINT_TYPE;
	subjectObjects: SubjectObject[];
}

export interface ParsedSubjectObjet extends SubjectObject {
	parsedSubject: ParsedSubject;
	docs: any;
	deprecated: any;
	pending: any;
	urlSubjectLink: string;
	colorCodedSubject: string;
}

const EndpointsTableOfContentsComponent = ({ type, subjectObjects }: Props) => {
	const { uiStore, endpointStore } = useStore();
	const [sortedGroups, setSortedGroups]: [{ [x: string]: ParsedSubjectObjet[] }, Function] = useState({});
	const typeTitle = type.substring(0, 1).toUpperCase() + type.substring(1);

	const parseEndpoint = (subjectObj: SubjectObject) => {
		const endpoint = endpointStore.getEndpointBySubject(subjectObj.serviceName, subjectObj.subject);

		let isPubEndpoint;
		let urlSubjectLink;

		if (type !== ENDPOINT_TYPE.HTTP) {
			isPubEndpoint = subjectObj.subject.length > 2 && subjectObj.subject.substring(0, 3) === "pub";
			urlSubjectLink = isPubEndpoint ? `${subjectObj.serviceName}+${subjectObj.subject}` : subjectObj.subject;
		}

		const parsedSubject = ViewUtils.parseSubjectToAPIUrl(subjectObj.subject);

		return {
			...subjectObj,
			parsedSubject,
			docs: endpoint.docs,
			deprecated: endpoint.deprecated,
			pending: endpoint.pending,
			urlSubjectLink,
			colorCodedSubject: type === ENDPOINT_TYPE.SERVICE || type === ENDPOINT_TYPE.WS
				// @ts-ignore
				? ViewUtils.getColorCodedTitle(ViewUtils.getStyledUrlParamUrlString(subjectObj.subject, "."))
				: ViewUtils.getStyledUrlParamUrl(parsedSubject.url)
		};
	};

	useMemo(() => {
		const output = {};

		Object.keys(subjectObjects)
			.sort()
			.map(group => {
				let groupName = group;

				if (groupName === ":userId")
					groupName = "out";

				output[groupName] = subjectObjects[group].map(parseEndpoint);
			});

		setSortedGroups(output);
	}, [subjectObjects]);

	const getNoEndpointsText = () => {
		return <>No endpoints</>;
	}

	const httpEndpoints = () => {
		const elems = Object.keys(sortedGroups).map((group, i) => {
			const subjectObjs = sortedGroups[group];

			if (!subjectObjs.filter(subjectObj => !subjectObj.hidden).length)
				return null;

			const subjectsMarkup = subjectObjs.map((subjectObj, i) => {
				return (
					<>
						<li
							key={i}
							hidden={subjectObjects[group] && subjectObjects[group][i] && subjectObjects[group][i].hidden}
							title={subjectObj.docs ? subjectObj.docs.description : ""}
							className={`${subjectObj.deprecated ? "deprecated" : ""} ${subjectObj.pending ? "pending" : ""}`}
						>
							<a
								href={"#" + subjectObj.parsedSubject.method + "-to-" + subjectObj.parsedSubject.url}
								onClick={() => uiStore.open(subjectObj.parsedSubject.method + "-to-" + subjectObj.parsedSubject.url)}
							>
								{subjectObj.urlSubjectLink}
								<span className={subjectObj.parsedSubject.method}>
									{subjectObj.parsedSubject.method}
								</span> to {subjectObj.colorCodedSubject}
							</a>
						</li>
					</>
				)
			}).filter(e => !!e);

			return (
				<span
					key={group + i}>
					<a href={"#" + group + "-http"}>
						<h4>{group}</h4>
					</a>

					<ul
						className="http"
						title={`${group} endpoints`}>
						{subjectsMarkup}
					</ul>

				</span>
			)
		})
			.filter(elem => !!elem);

		return (
			<>
				<a href="#http-endpoints">
					<h3>Http endpoints</h3>
				</a>

				{elems.length > 0 ? elems : getNoEndpointsText()}
			</>
		);
	}

	const otherEndpoints = () => {
		const elems = Object.keys(sortedGroups).map((group, i) => {
			const subjectObjs = sortedGroups[group];

			if (!subjectObjs.filter(subjectObj => !subjectObj.hidden).length)
				return null;

			const subjectsMarkup = subjectObjs.map((subjectObj, i) => {
				const hidden = subjectObjects[group] && subjectObjects[group][i] && subjectObjects[group][i].hidden;

				return (
					<li
						key={i}
						hidden={hidden}
						title={subjectObj.docs ? subjectObj.docs.description : ""}
						className={`${subjectObj.deprecated ? "deprecated" : ""} ${subjectObj.pending ? "pending" : ""}`}
					>
						<a
							href={"#" + subjectObj.urlSubjectLink}
							onClick={() => uiStore.open(subjectObj.urlSubjectLink)}
						>
							{subjectObj.colorCodedSubject}
						</a>
					</li>
				)
			}).filter(e => !!e);

			return (
				<span
					key={group + i}>
					<a href={"#" + group + "-" + typeTitle.toLowerCase()}>
						<h4>{group}</h4>
					</a>

					<ul
						title={`${typeTitle} endpoints`}
						className={typeTitle.toLowerCase()}>
						{subjectsMarkup}
					</ul>
				</span>
			)
		}).filter(e => !!e);

		return (
			<>
				<a href={"#" + typeTitle.toLowerCase() + "-endpoints"}>
					<h3>{typeTitle} endpoints</h3>
				</a>

				{elems.length > 0 ? elems : getNoEndpointsText()}
			</>
		);
	}

	return (
		<div
			title={typeTitle + " endpoints"}
			className="col-md-6 endpoints">

			{type === ENDPOINT_TYPE.HTTP
				? httpEndpoints()
				: otherEndpoints()}
		</div>
	);
};

export default observer(EndpointsTableOfContentsComponent);
