export default ({ body, title, initialState, nightmode }) => {
	return `
    <!DOCTYPE html>
    <html>
        <head>
            <script>window._APP_STATE_ = ${initialState};</script>
            <title>${title}</title>
            <link rel="stylesheet" href="/assets/index.css" />
            <link rel="stylesheet" href="assets/googlecode.min.css">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>
			<script
				src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
				integrity="sha256-pasqAKBDmFT4eHoN2ndd6lN370kFiGUFyTiUHWhU7k8="
				crossorigin="anonymous"></script>
        </head>

        <body class="${nightmode ? "nightmode" : ""}">
            <div id="root">${body}</div>
        </body>

        <script type="text/javascript" src="assets/json-schema-faker.min.js"></script>
        <script type="text/javascript" src="assets/node-docson.min.js"></script>

        <script src="assets/client.js"></script>
        <browser-refresh enabled="true" />

        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    </html>
`;
};
