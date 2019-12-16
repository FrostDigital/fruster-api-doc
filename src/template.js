export default ({ body, title, initialState }) => {
	return `
    <!DOCTYPE html>
    <html>
        <head>
            <script>window._APP_STATE_ = ${initialState};</script>
            <title>${title}</title>
            <link rel="stylesheet" href="/assets/index.css" />
            <link rel="stylesheet" href="assets/googlecode.min.css">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>
			<script src="assets/jquery-3.1.0.js" integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk=" crossorigin="anonymous"></script>
        </head>

        <body>
            <div id="root">${body}</div>
        </body>

        <script type="text/javascript" src="assets/json-schema-faker.min.js"></script>
        <script type="text/javascript" src="assets/node-docson.min.js"></script>

        <script src="assets/client.js"></script>
        <script src="assets/babel-polyfill.js"/>
        <browser-refresh enabled="true" />

        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    </html>
`;
};
