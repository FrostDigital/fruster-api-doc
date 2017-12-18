export default ({ body, title, initialState }) => {
  return `
<!DOCTYPE html>
<html>

<head>
  <script>window._APP_STATE_ = ${ initialState};</script>
  <title>${title}</title>
  <link rel="stylesheet" href="/assets/index.css" />
  <link rel="stylesheet" href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.12.0/build/styles/googlecode.min.css">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>
</head>

<body>
  <div id="root">${body}</div>
</body>

<script src="https://code.jquery.com/jquery-3.1.0.js" integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk=" crossorigin="anonymous"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/json-schema-faker/0.3.4/json-schema-faker.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
<script src="assets/client.js"></script>
<script src="assets/babel-polyfill.js"/>


<browser-refresh enabled="true" />


</html>
`;
};


//<script src="/assets/bundle.js"></script>