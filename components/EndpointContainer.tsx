import { observer } from "mobx-react";
import React, { useMemo, useState } from "react";
import { ICON } from "../constants";
import { ENDPOINT_TYPE } from "../models/Endpoint";
import { SubjectObject } from "../stores/EndpointStore";
import { useStore } from "../stores/StoreContext";
import { ActionButton } from "../theme/Buttons";
import EndpointDetailsComponent from "./EndpointDetailsComponent";
import Icon from "./Icon";

interface Props {
	subjectObjs: SubjectObject[];
	group: string;
	type: ENDPOINT_TYPE;
}

const EndpointContainer = ({ group, subjectObjs, type }: Props) => {
	const { endpointStore } = useStore();

	const [checked, setChecked] = useState(true);

	const checkboxStates = {};

	subjectObjs.forEach(subjectObj => {
		const [state, setState] = useState(true);
		checkboxStates[subjectObj.subject] = { state, setState };
	});

	const endpoints = useMemo(() => subjectObjs.map(subjectObj => endpointStore.getEndpointBySubject(subjectObj.serviceName, subjectObj.subject)), [false]);
	const subjectObjById = useMemo(() => {
		const output = {};

		subjectObjs.forEach(subjectObj => output[subjectObj.subject] = subjectObj);

		return output;
	}, [subjectObjs]);

	const isWsUserIdEndpoint = group === ":userId";

	if (isWsUserIdEndpoint)
		group = "out";

	const getCheckedEndpoints = () => {
		const endpointsBySubject = {};

		subjectObjs.forEach(subjectObj => endpointsBySubject[subjectObj.subject] = { hidden: subjectObj.hidden });

		return Object.keys(checkboxStates)
			.map(subject => {
				if (checkboxStates[subject].state && !endpointsBySubject[subject].hidden)
					return subject;
			})
			.filter(subject => !!subject)
			.join(",");
	};

	const checkAll = () => {
		const newCheckedStatus = !checked;

		Object.keys(checkboxStates).forEach(subject => checkboxStates[subject].setState(newCheckedStatus));

		setChecked(newCheckedStatus);
	}

	const onCheckboxChecked = (e) => {
		const { setState } = checkboxStates[e.target.name];

		setState(e.target.checked);
		setChecked(false);
	}

	const getEndpoints = () => {
		return endpoints
			.map((endpoint, i) => {
				const schemas = useMemo(() => endpoint.schemas
					.filter(schema => {
						if (schema) {
							switch (true) {
								case schema.id === endpoint.requestSchema:
								case schema.id === endpoint.responseSchema:
								case endpoint.requestSchema && typeof endpoint.requestSchema === "object" && schema.id === endpoint.requestSchema.id:
								case endpoint.responseSchema && typeof endpoint.responseSchema === "object" && schema.id === endpoint.responseSchema.id:
									return schema;
							}
						}
					}), [false]);

				useMemo(() => {
					if (endpoint.requestSchema && typeof endpoint.requestSchema === "object") {
						if (!schemas.find(schema => typeof endpoint.requestSchema === "object" && schema.id === endpoint.requestSchema.id))
							schemas.push(endpoint.requestSchema);

						endpoint.requestSchema = endpoint.requestSchema.id;
					}

					if (endpoint.responseSchema && typeof endpoint.responseSchema === "object") {
						if (!schemas.find(schema => typeof endpoint.responseSchema === "object" && schema.id === endpoint.responseSchema.id))
							schemas.push(endpoint.responseSchema);

						endpoint.responseSchema = endpoint.responseSchema.id;
					}
				}, [false]);

				return (
					<span
						hidden={subjectObjById[endpoint.subject] && subjectObjById[endpoint.subject].hidden}
						key={i}
					>
						<hr />
						<EndpointDetailsComponent
							type={type}
							hidden={subjectObjById[endpoint.subject] && subjectObjById[endpoint.subject].hidden}
							subject={endpoint.subject}
							serviceName={endpoint.serviceName}
							schemas={schemas}
							onCheck={e => onCheckboxChecked(e)}
							checked={checkboxStates[endpoint.subject].state}
						/>
					</span >
				)
			});
	}

	const checkedEndpoints = useMemo(() => getCheckedEndpoints(), [checkboxStates]);

	return (
		<div
			hidden={!subjectObjs.filter(subjectObj => !subjectObj.hidden).length}
			id={group + "-" + (type || "service")}
			className={"service-container " + group + "-"}>
			{
				// To not break old links to #:userId-ws
				isWsUserIdEndpoint && <div id=":userId-ws" />
			}

			<a href={"#" + group + "-" + (type || "service")}><h2>{group}</h2></a>

			{
				type === "service" &&
				<span className="service-btn">
					<label
						htmlFor={group + "-" + (type || "service") + "-" + "select-all"}
					>
						Select / deselect all
                    </label>&nbsp;
					<input
						id={group + "-" + (type || "service") + "-" + "select-all"}
						onChange={checkAll}
						checked={checked}
						type="checkbox" /> |

                        <a href={`/service-client/${group}?subjects=${useMemo(() => encodeURIComponent(checkedEndpoints), [checkedEndpoints])}`}>

						<ActionButton disabled={!checkedEndpoints.length}>Download service client <Icon disabled={!checkedEndpoints.length} type={ICON.DOWNLOAD} /></ActionButton>
					</a>
				</span>
			}

			{getEndpoints()}

		</div>
	);
};

export default observer(EndpointContainer);
