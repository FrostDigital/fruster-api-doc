// Client code goes here.
const JSONFormatter = require("json-formatter-js");

$(() => {
    const jsonSchemaJson = "#modal #json-schema-json";
    const sampleJson = "#modal #sample-json";
    const copyJsonSchemaJson = "#modal #copy-json-schema-json";
    const copySampleJson = "#modal #copy-sample-json";

    if ($(".service-container").length === 0) {
        $("#try-again-warning").show();
        $("#refresh-page").click(event => {
            location.reload();
        });
    }

    console.log(window._APP_STATE_);

    if (window._APP_STATE_.schemasContainErrors)
        $("#try-again-warning").show();

    $(".request-schema").click(clickEvent);
    $(".response-schema").click(clickEvent);
    $(copyJsonSchemaJson).click(() => $(jsonSchemaJson).toggle());
    $(copySampleJson).click(() => $(sampleJson).toggle());

    $("#reset-cache").click(resetCache);

    /**
     * @param {Object} event click event
     */
    function resetCache(event) {
        if (confirm("This should only be used when old endpoints still show up in the list. \nAre you sure you want to reset the cache?")) {
            $.post("/reset-cache")
                .then(() => {
                    location.reload();
                });
        }
    }

    /**
     * @param {Object} event click event
     */
    function clickEvent(event) {
        event.preventDefault();
        console.log("clicked"); // <-- Sanity check console log if something wouldn't work as expected.

        const entryClasses = $(event.currentTarget).attr('class').split(/\s+/);
        const service = entryClasses[1];
        const schemaId = entryClasses[2];
        let schema = window._APP_STATE_.schemasPerService[service] ? window._APP_STATE_.schemasPerService[service].find(schema => schema.id === schemaId) : null;

        if (typeof schema === "object" && !!schema) {
            schema = sortObject(schema);

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

            $("#close-btn").click(event => {
                $('#modal').modal("hide");
            });
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

/**
 * Goes through keys in object (as well as its sub objects and arrays), sorts the keys and reinserts data in sorted order.
 * 
 * @param {Object} obj object to sort keys for
 */
function sortObject(obj) {
    return sortLayer(obj);

    function sortLayer(layer) {
        const output = {};

        Object.keys(layer).sort().forEach(key => {
            if (!!layer[key] && typeof layer[key] === "object" && !(layer[key] instanceof Array)) {
                /** If object, loop through another layer */
                output[key] = sortLayer(layer[key]);
            } else if (!!layer[key] && (layer[key] instanceof Array)) {
                /**If array; sort array */
                layer[key].sort();

                if (typeof layer[key][0] === "object") {
                    /** If array contains objects; loop through and sort each object */
                    const sortedObj = sortLayer(layer[key]);
                    output[key] = [];

                    Object.keys(sortedObj).forEach(sortedObjkey => {
                        /** Add back objects in an array (To prevent result being converted from array to object while using Object.keys) */
                        if (!output[key])
                            output[key] = [];

                        output[key].push(sortedObj[sortedObjkey]);
                    });
                } else {
                    output[key] = layer[key];
                }
            } else {
                output[key] = layer[key];
            }
        });

        return output;
    }
}