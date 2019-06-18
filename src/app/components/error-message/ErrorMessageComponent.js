import React from "react";
import ViewUtils from "../../../utils/ViewUtils";
import JsonSchemaModalComponent from "../modal/JsonSchemaModalComponent";

export default class ErrorMessageComponent extends React.Component {

    constructor(props) {
        super(props);

        this.preparedSchemasWithErrors = {};
        this.prepareSchemasWithErrors();
    }

    render() {
        const { numberOfEndpoints, schemasWithErrors } = this.props;

        if (!schemasWithErrors && numberOfEndpoints !== 0)
            return <React.Fragment />;

        return (
            <div
                title="error message"
                className="alert alert-danger">

                {numberOfEndpoints === 0 && this.getMissingEndpointsText()}

                {schemasWithErrors && this.getSchemasWithErrors()}

            </div>
        )
    }

    shouldComponentUpdate() {
        return false;
    }

    getMissingEndpointsText() {
        return (
            <React.Fragment>
                <strong>Note:</strong> Something went wrong or there are no endpoints registered; <a id="refresh-page" href="#" onClick={() => this.refreshPage()}>
                    please refresh the page.
                </a>
            </React.Fragment>
        );
    }

    /**
     * Prepares errors so that they can be shown inside a modal.
     */
    prepareSchemasWithErrors() {
        if (this.props.schemasWithErrors)
            Object.keys(this.props.schemasWithErrors).forEach(serviceName => {
                const schemas = this.props.schemasWithErrors[serviceName];

                schemas.forEach(schema => {
                    if (!this.preparedSchemasWithErrors[`${serviceName}-${schema.id}`])
                        this.preparedSchemasWithErrors[`${serviceName}-${schema.id}`] = {};

                    this.preparedSchemasWithErrors[`${serviceName}-${schema.id}`].schema = schema;
                });
            });
    }

    /**
     * Displays all schemas with errors and makes it possible to open each in a modal.
     */
    getSchemasWithErrors() {
        return (
            <React.Fragment>
                <p title=" Error(s) were detected in the following json schemas"><strong>Note:</strong> Error(s) were detected in the following json schemas:</p>

                <ul id="errors-list" title="schemas with errors">
                    {
                        ViewUtils.sortedForEach(this.props.schemasWithErrors, (schemas, serviceName) => {

                            return ViewUtils.sortedForEach(schemas, (schemaWithError, index, i) => {

                                return (
                                    <li
                                        key={schemaWithError.id}
                                        className={"request-schema" + " " + serviceName + " " + schemaWithError.id}>
                                        <a href="" onClick={(e) => { this.openSchemaWithError(e, serviceName, schemaWithError.id) }}>
                                            {schemaWithError.id} <span className="glyphicon glyphicon-new-window"></span>
                                        </a> from {serviceName}

                                        <JsonSchemaModalComponent
                                            endpointUrl={"error"}
                                            ref={`${serviceName}-${schemaWithError.id}`}
                                            schema={this.preparedSchemasWithErrors[`${serviceName}-${schemaWithError.id}`].schema}
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
    openSchemaWithError(e, serviceName, schemaId) {
        e.preventDefault();

        if (this.refs[`${serviceName}-${schemaId}`])
            this.refs[`${serviceName}-${schemaId}`].openModal();
    }

    /**
     * Refreshes the page.
     */
    refreshPage() {
        location.reload();
    }

}