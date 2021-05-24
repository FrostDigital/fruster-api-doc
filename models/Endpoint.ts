type StringObject = {
	[x: string]: string;
};

export enum HTTP_METHOD {
	POST = "POST",
	GET = "GET",
	PUT = "PUT",
	DELETE = "DELETE"
}

export enum ENDPOINT_TYPE {
	HTTP = "http",
	SERVICE = "service",
	WS = "ws"
}

export interface Endpoint {

	group: string;

	subject: string;

	serviceName: string;

	instanceId: string;

	sourceVersion: string;

	createQueueGroup: boolean;

	mustBeLoggedIn: boolean;

	hidden: boolean;

	permissions: string[] | string[][] | null;

	forwardToHttp: boolean | null;

	requestSchema: string | { id: string } | null;

	responseSchema: string | { id: string } | null;

	validateRequest: boolean;

	deprecated: boolean | null;

	pending: boolean | null;

	docs: {

		description: string;

		errors: StringObject;

		params: StringObject;

		query: StringObject;

	};

	parsedSubject: {

		subject: string;

		isHttp: boolean;

		httpMethod?: HTTP_METHOD;

	};

	natsSubscribeOptions: {

		queue: string;

	};

	schemas: any[];

	cUrl: string;

	type: string;

}
