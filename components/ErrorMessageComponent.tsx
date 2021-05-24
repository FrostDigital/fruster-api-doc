import React, { useEffect, useState } from "react";
import ViewUtils from "../utils/ViewUtils";
import JsonSchemaModalComponent from "./JsonSchemaModalComponent";
import { useRouter } from "next/router";
import styled from "styled-components";
import Icon from "./Icon";
import { ICON } from "../constants";
import { useStore } from "../stores/StoreContext";


const ErrorMessageComponent = () => {
	const { endpointStore } = useStore();
	const router = useRouter();
	let preparedSchemasWithErrors: any;

	const schemasWithErrors = endpointStore.schemasWithErrors;

	const modalRefs = {};

	useEffect(() => prepareSchemasWithErrors(), [false]);

	if (schemasWithErrors)
		Object.keys(schemasWithErrors).forEach(serviceName => {
			const schemas = schemasWithErrors[serviceName];

			schemas.forEach(schema => {
				const [modalIsOpen, setIsOpen] = useState(false);
				modalRefs[`${serviceName}-${schema.id}`] = { modalIsOpen, setIsOpen };
			});
		});

	const prepareSchemasWithErrors = () => {
		if (!preparedSchemasWithErrors)
			preparedSchemasWithErrors = {};

		if (schemasWithErrors)
			Object.keys(schemasWithErrors).forEach(serviceName => {
				const schemas = schemasWithErrors[serviceName];

				schemas.forEach(schema => {
					if (!preparedSchemasWithErrors[`${serviceName}-${schema.id}`])
						preparedSchemasWithErrors[`${serviceName}-${schema.id}`] = {};

					preparedSchemasWithErrors[`${serviceName}-${schema.id}`].schema = schema;
				});
			});
	}

	/**
	 * Prepares errors so that they can be shown inside a modal.
	 */
	const getMissingEndpointsText = () => {
		return (
			<>
				<strong>Note:</strong> Something went wrong or there are no endpoints registered; <a href="/" onClick={() => router.reload()}>
					please refresh the page.
                </a>
			</>
		);
	}

	/**
	 * Displays all schemas with errors and makes it possible to open each in a modal.
	 */
	const getSchemasWithErrors = () => {
		if (!preparedSchemasWithErrors)
			prepareSchemasWithErrors();

		return (
			<React.Fragment>
				<p title=" Error(s) were detected in the following json schemas"><strong>Note:</strong> Error(s) were detected in the following json schemas:</p>

				<ul id="errors-list" title="schemas with errors">
					{
						ViewUtils.sortedForEach(schemasWithErrors, (schemas, serviceName) => {

							return ViewUtils.sortedForEach(schemas, (schemaWithError, index, i) => {

								return (
									<li
										key={i}
										className={"request-schema" + " " + serviceName + " " + schemaWithError.id}>
										<a href="/" onClick={(e) => { openSchemaWithError(e, serviceName, schemaWithError.id) }}>
											{schemaWithError.id || "NO_NAME"} <Icon type={ICON.OPEN_IN_MODAL} />
										</a> from {serviceName}

										<JsonSchemaModalComponent
											hidden={false}
											modalOpen={modalRefs[`${serviceName}-${schemaWithError.id}`].modalIsOpen}
											onClose={() => modalRefs[`${serviceName}-${schemaWithError.id}`].setIsOpen(false)}
											endpointUrl={"error"}
											schema={preparedSchemasWithErrors[`${serviceName}-${schemaWithError.id}`].schema}
											isOpenedFromErrorsMenu={true}
											isError={true} />
									</li>
								);
							})
						})
					}
				</ul>
			</React.Fragment>
		);
	}

	/**
	 * Opens a specific error in a modal.
	 */
	const openSchemaWithError = (e, serviceName, schemaId) => {
		e.preventDefault();

		if (modalRefs[`${serviceName}-${schemaId}`])
			// @ts-ignore
			modalRefs[`${serviceName}-${schemaId}`].setIsOpen(true);
	}

	if (!schemasWithErrors && endpointStore.allEndpoints.length !== 0)
		return <React.Fragment />;

	return (
		<StyledErrorContainer
			title="error message"
			className="alert alert-danger">

			{endpointStore.allEndpoints.length === 0 && getMissingEndpointsText()}

			{schemasWithErrors && getSchemasWithErrors()}

		</StyledErrorContainer>
	)
};

export default ErrorMessageComponent;


const StyledErrorContainer = styled.div`
	margin-top: 10px;
`;
