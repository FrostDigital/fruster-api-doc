import { API_ROOT, BUS, PORT, METADATA_POLL_RATE } from "./config";
import next from "next";
import { connect, status } from "fruster-bus";
import cookieParser from "cookie-parser";
import { loadMetadata, resetCache } from "./utils/metadata-utils";
import express from "express";
import ServiceClientGenerator from "./utils/service-client-generator/ServiceClientGenerator";
import * as _ from "lodash";
import log from "fruster-log";
import util from "util";
import compression from "compression";
import { replaceAll } from "./utils/utils";

const devProxy = {
	"/api": {
		target: API_ROOT,
		cookieDomainRewrite: "",
		secure: true,
		changeOrigin: true,
		pathRewrite: {
			"^/api": "",
		},
	},
}

const port = PORT;
const env = process.env.NODE_ENV;
const dev = env !== "production";
const app = next({
	dir: ".",
	dev,
});

const handle = app.getRequestHandler();

let server;

if (!dev)
	require("fruster-health").start();

let metadata = {
	lastCachedDate: new Date(),
	endpointsByType: { http: {}, service: {}, ws: {} },
	allEndpoints: [],
	lastSchemasWithErrors: undefined
};

app
	.prepare()
	.then(async () => {
		server = express();

		server.use(cookieParser());

		server.use(compression());

		const { createProxyMiddleware } = require("http-proxy-middleware");

		Object.keys(devProxy).forEach(function (context) {
			server.use(context, createProxyMiddleware(devProxy[context]))
		});

		server.post("/nightmode", (req, res) => {
			res.setHeader("Set-Cookie", `${"fruster-api-doc-nightmode"}=true;Secure;expires=Fri, 27 Dec ${new Date().getFullYear() + 30} 09:03:34 GMT;`);
			res.end();
		});

		server.delete("/nightmode", (req, res) => {
			res.setHeader("Set-Cookie", `${"fruster-api-doc-nightmode"}=true;Secure;expires=Fri, 27 Dec 1970 09:03:34 GMT;`);
			res.end();
		});

		server.post("/reset-cache", (req, res) => {
			doResetCache();

			metadata = {
				lastCachedDate: new Date(),
				endpointsByType: { http: {}, service: {}, ws: {} },
				allEndpoints: [],
				lastSchemasWithErrors: undefined
			};

			res.status(200);
			res.end();
		});

		// TODO:
		server.get("/state", (req, res) => {
			res.json(metadata);
		});

		server.get("/service-list", async (req, res) => {
			// @ts-ignore
			if (!metadata.endpointsByType.service || metadata.endpointsByType.service.length)
				// @ts-ignore
				metadata = await loadMetadata();

			res.json({ services: Object.keys(metadata.endpointsByType.service) });
		});

		server.get("/service/:serviceName/endpoints", async (req, res) => {
			// @ts-ignore
			if (!metadata.endpointsByType.service || metadata.endpointsByType.service.length)
				// @ts-ignore
				metadata = await loadMetadata();

			const serviceName = req.params.serviceName;
			const endpoints = metadata.endpointsByType.service[serviceName].map(({ subject, docs: { description } }) => ({ subject, description }));

			res.json({ endpoints });
		});

		server.get("/service-client/:serviceName", async (req, res) => {
			try {
				const type = "service";
				const serviceName = req.params.serviceName;

				if (!metadata.endpointsByType.service[serviceName])
					// @ts-ignore
					metadata = await loadMetadata();

				const endpoints = metadata.endpointsByType.service[serviceName];

				const options = { serviceName, type, endpoints, subjects: req.query.subjects };

				const serviceClientGenerator = new ServiceClientGenerator(options);
				const className = replaceAll(_.startCase(serviceName), " ", "") + "Client";

				const file = serviceClientGenerator.toJavascriptClass();

				res.setHeader("Content-type", "application/javascript");
				res.setHeader("Content-disposition", `attachment; filename=${className}.js`);

				res.end(file);
			} catch (err) {
				log.warn(err);
				res.end(`<html><body>Could not generate service client!!. <br/>Reason:  <br/><code><pre>${util.inspect(err, null, null)}</pre></code></body></html>`);
			}
		});


		server.all("*", (req, res) => handle(req, res));

		server.listen(port, async (err) => {
			if (err)
				throw err;

			if (!status.connected)
				await connect(BUS);

			console.log(`
==================================================
Fruster
==================================================
  █████╗ ██████╗ ██╗    ██████╗  ██████╗  ██████╗
 ██╔══██╗██╔══██╗██║    ██╔══██╗██╔═══██╗██╔════╝
 ███████║██████╔╝██║    ██║  ██║██║   ██║██║
 ██╔══██║██╔═══╝ ██║    ██║  ██║██║   ██║██║
 ██║  ██║██║     ██║    ██████╔╝╚██████╔╝╚██████╗
 ╚═╝  ╚═╝╚═╝     ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝
==================================================
	  Server running at http://localhost:${port}/
==================================================
`);

			console.log(`> Ready on port ${port} [${env}]`);

			// @ts-ignore
			metadata = await loadMetadata();

			setInterval(async () => {
				// TODO:
				// @ts-ignore
				metadata = await loadMetadata();
			}, METADATA_POLL_RATE);
		});


	})
	.catch((err) => {
		console.log("An error occurred, unable to start the server");
		console.log(err);
	});

// }

// runServer();

function doResetCache() {
	console.log("Resetting cache");
	resetCache();
}

