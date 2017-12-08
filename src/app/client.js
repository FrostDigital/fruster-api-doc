// Client code goes here.
const JSONFormatter = require("json-formatter-js");

$(() => {
    const jsonSchemaJson = "#modal #json-schema-json";
    const sampleJson = "#modal #sample-json";
    const copyJsonSchemaJson = "#modal #copy-json-schema-json";
    const copySampleJson = "#modal #copy-sample-json";

    $(".request-schema").click(clickEvent);
    $(".response-schema").click(clickEvent);
    $(copyJsonSchemaJson).click(() => $(jsonSchemaJson).toggle());
    $(copySampleJson).click(() => $(sampleJson).toggle());

    /**
     * @param {Object} event click event
     */
    function clickEvent(event) {
        const entryClasses = $(event.currentTarget).attr('class').split(/\s+/);
        const service = entryClasses[1];
        const schemaId = entryClasses[2];
        const schema = window._APP_STATE_.schemasPerService[service] ? window._APP_STATE_.schemasPerService[service].find(schema => schema.id === schemaId) : null;

        console.log(schema);

        if (typeof schema === "object" && !!schema) {
            const schemaToJson = Object.assign({}, schema);
            delete schemaToJson.sample;

            const jsonSchemaHtml = getJsonHtml(schemaToJson);
            const sampleHtml = getJsonHtml(schema.sample);

            const header = "#modal #header";
            const jsonSchema = "#modal #json-schema";
            const jsonSample = "#modal #json-sample";

            $(header).text(schema.id);
            $(jsonSchema).append(jsonSchemaHtml);
            $(jsonSample).append(sampleHtml);

            $(jsonSchemaJson).append(JSON.stringify(schemaToJson));
            $(sampleJson).append(JSON.stringify(schema.sample));

            $('#modal').modal();

            $('#modal').on("hide.bs.modal", () => {
                $(jsonSchemaJson).hide();
                $(sampleJson).hide();
                $(header).empty();
                $(jsonSchema).empty();
                $(jsonSample).empty();
                $(jsonSchemaJson).empty();
                $(sampleJson).empty();
            });
        }
    }

    /**
     * @param {Object} json json to transform to html
     */
    function getJsonHtml(json) {
        const formatter = new JSONFormatter.default(json, 1, {
            animateOpen: false,
            animateClose: false
        });
        formatter.openAtDepth(Infinity);
        return formatter.render()
    }

});
