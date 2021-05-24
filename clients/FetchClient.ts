const INVALID_COOKIE_CODE = "auth-service.403.1";
const NOT_LOGGED_IN_CODE = "MUST_BE_LOGGED_IN";
import { API_ROOT } from "../config";

type RequestOptions = {
	method: string;
	path: string;
	query?: { [x: string]: any };
	body?: any;
	authCookie?: any;
};

type GetDeleteRequestOptions = {
	path: string;
	query?: { [x: string]: any };
	authCookie?: any;
};

type PostPutRequestOptions = {
	path: string;
	body?: any
};

type MultipartUploadRequestOptions = {
	path: string;
	file: any
};

class FetchClient {

	private requestCount: number;

	private baseFetchOptions: any;

	private apiRoot: string;

	private jwtCookie: string;

	constructor({ fetch = undefined, apiRoot = API_ROOT || "/api" } =
		{
			fetch: undefined,
			apiRoot: "/api"
		}, jwtCookie?) {
		this.jwtCookie = jwtCookie;

		if (apiRoot)
			this.apiRoot = apiRoot;

		this.requestCount = 0;

		this.baseFetchOptions = {
			mode: "cors",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		};
	}

	async get({ path, query }: GetDeleteRequestOptions) {
		return await this.doRequest({ method: "get", path, query });
	}

	async post({ path, body }: PostPutRequestOptions) {
		return await this.doRequest({ method: "post", path, body });
	}

	async put({ path, body }: PostPutRequestOptions) {
		return await this.doRequest({ method: "put", path, body });
	}

	async delete({ path, query }: GetDeleteRequestOptions) {
		return await this.doRequest({ method: "delete", path, query });
	}

	async doRequest({ method, path, query, body }: RequestOptions) {
		this.requestCount++;

		const fetchOptions = {
			...this.baseFetchOptions,
			method,
			body: body ? JSON.stringify(body) : undefined
		};

		if (this.jwtCookie && !process.browser)
			fetchOptions.headers = { ...fetchOptions.headers, Authorization: `Bearer ${this.jwtCookie}` };

		const qs = query ? "?" + this._objectToQueryString(query) : "";

		// const resp = await this.fetch(this.apiRoot + path + qs, fetchOptions);
		const resp = await fetch(this.apiRoot + path + qs, fetchOptions);

		this.requestCount--;

		let jsonResp: any;

		if (!resp.ok) {
			try {
				jsonResp = await resp.json();
			} catch (err) {
				console.error(resp);
			}

			this.showErrorToast(jsonResp ?? resp);

			throw jsonResp;
		}

		try {
			jsonResp = await resp.json();
		} catch (err) {
			// eslint-disable-next-line
			console.log("Failed parsing json response", err);
			// eslint-disable-next-line
			throw {
				status: 500,
				error: {
					code: "CLIENT_ERROR",
					detail:
						"Something went wrong when parsing json response on client: " +
						err,
				},
			};
		}

		return jsonResp;
	}

	/**
	 * Object to create query string from a JSON object.
	 */
	_objectToQueryString(o = {}): string {
		const arr = Object.keys(o).map((k) => {
			if (o[k])
				return encodeURI(k + "=" + o[k]);
		})
			.filter(o => !!o);

		return arr.join("&");
	}

	doMultipartUpload({ path, file }: MultipartUploadRequestOptions): any {
		let formData = new FormData();
		formData.append("file", file);

		const reqOpts = {
			method: "POST",
			body: formData,
		};

		const apiRoot = this.apiRoot;
		const url = createUrl(path);
		const req = new Request(url, reqOpts);

		return fetch(req).then(async (res) => {
			let jsonResp;

			if (!res.ok) {
				try {
					jsonResp = await res.json();
				} catch (err) {
					console.error(res);
				}

				this.showErrorToast(jsonResp ?? res);

				throw jsonResp;
			}

			return res.json().then((json) => {
				// Fetch API always enters success even though an error
				// was returned. Check this here and throw error to be able
				// to .catch error later in promise chain.

				return json.data;
			});
		});

		function createUrl(path, query = {}) {
			let url = apiRoot + path;

			if (Object.keys(query)) {
				url += "?";

				Object.keys(query).forEach((key) => {
					if (query[key] !== undefined) {
						url += key + "=" + query[key] + "&";
					}
				});

				url = url.slice(0, -1); // remove last &
			}

			return url;
		}
	}

	showErrorToast(error) {
		// if (statusCode !== 404) window.alert("Något gick snett!");
		if (error.err && process.browser)
			alert(error.detail + " " + error.title);
		else
			console.error(error);
	}

	toJSON() {
		return "{}";
	}
}

export default FetchClient;
