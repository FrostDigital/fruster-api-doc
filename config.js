module.exports = {

    bus: process.env.BUS || "nats://localhost:4222",

    /** Port to be running webserver on */
    port: parseInt((process.env.PORT || 8080), 10),

    /** The url to the api root, in order to display accurate urls */
    apiRoot: process.env.API_ROOT || "{[host}}",

    /** Project name in order to display the name in the header and title of the page */
    projectName: process.env.PROJECT_NAME || ""

};