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

                schemas.forEach(schemaName => {
                    if (!this.preparedSchemasWithErrors[`${serviceName}-${schemaName}`])
                        this.preparedSchemasWithErrors[`${serviceName}-${schemaName}`] = {};

                    if (this.props.schemasPerService[serviceName])
                        this.preparedSchemasWithErrors[`${serviceName}-${schemaName}`].schema = this.props.schemasPerService[serviceName].find(schema => schema.id === schemaName);
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
                                        key={i}
                                        className={"request-schema" + " " + serviceName + " " + schemaWithError}>
                                        <a href="" onClick={(e) => { this.openSchemaWithError(e, serviceName, schemaWithError) }}>
                                            {schemaWithError} <span className="glyphicon glyphicon-new-window"></span>
                                        </a> from {serviceName}

                                        <JsonSchemaModalComponent
                                            ref={ref => { this.preparedSchemasWithErrors[`${serviceName}-${schemaWithError}`].ref = ref; }}
                                            subject={schemaWithError}
                                            schema={this.preparedSchemasWithErrors[`${serviceName}-${schemaWithError}`].schema}
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
    openSchemaWithError(e, serviceName, schemaWithError) {
        e.preventDefault();

        if (this.preparedSchemasWithErrors[`${serviceName}-${schemaWithError}`].ref)
            this.preparedSchemasWithErrors[`${serviceName}-${schemaWithError}`].ref.openModal();
    }

    /**
     * Refreshes the page.
     */
    refreshPage() {
        location.reload();
    }

}