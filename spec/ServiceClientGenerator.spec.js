const ServiceClientGenerator = require("../src/utils/service-client-generator/ServiceClientGenerator");
const fixtures = require("./support/fixtures");

describe("ServiceClientGenerator", () => {

	const metadata = fixtures.serviceMetadata();
	const metadata2 = fixtures.serviceMetadata2();
	const metadataQueryObject = fixtures.metadataQueryObject();

	const serviceName = "SpecService";
	const type = "service";

	it("should be return a single typedef", () => {
		const options = { serviceName, type, endpoints: metadata, subjects: "ip-time-report-service.create-entry" };

		const serviceClientGenerator = new ServiceClientGenerator(options);
		const generatedServiceClient = serviceClientGenerator.toJavascriptClass();

		expect(generatedServiceClient.includes("reqId, date, orderId, userId, shifts, breakParam, foodDeduction")).toBeTruthy("should have parameters from metadata");
		expect(generatedServiceClient.includes("@typedef {Object} Entry")).toBeTruthy("should add typedef for return");
		expect(generatedServiceClient.includes("@return {Promise<Entry>}")).toBeTruthy("should return a single `Entry`");
	});

	it("should be possible to return an array of a typedef", () => {
		const options = { serviceName, type, endpoints: metadata, subjects: "ip-time-report-service.get-entries-for-invoices" };

		const serviceClientGenerator = new ServiceClientGenerator(options);
		const generatedServiceClient = serviceClientGenerator.toJavascriptClass();

		expect(generatedServiceClient.includes("reqId, startDate, endDate, region, company")).toBeTruthy("should have parameters from metadata");
		expect(generatedServiceClient.includes("@typedef {Object} GetEntriesResponse")).toBeTruthy("should add typedef for return");
		expect(generatedServiceClient.includes("@return {Promise<Array<GetEntriesResponse>>}")).toBeTruthy("should return Array of GetEntriesResponse");
	});

	it("should add typedef as only one array", () => {
		const options = { serviceName, type, endpoints: metadata2, subjects: "ip-contract-service.get-by-query" };

		const serviceClientGenerator = new ServiceClientGenerator(options);
		const generatedServiceClient = serviceClientGenerator.toJavascriptClass();

		expect(generatedServiceClient.includes("@property {Array<Array<GetContractsResponseContracts>>} contracts")).toBeFalsy("should not add double arrays");
		expect(generatedServiceClient.includes("@property {Array<GetContractsResponseContracts>} contracts")).toBeTruthy("should only be one array");
	});

	it("should add detailed typedef for query", () => {
		const options = { serviceName, type, endpoints: metadataQueryObject, subjects: "ip-user-service.get-consultant-absence-by-query" };

		const serviceClientGenerator = new ServiceClientGenerator(options);
		const generatedServiceClient = serviceClientGenerator.toJavascriptClass();

		expect(generatedServiceClient.includes("@param {Object=} param0.query")).toBeFalsy("should not add query as simple object");
		expect(generatedServiceClient.includes("@param {GetConsultantAbsenceByQueryRequestQuery=} param0.query")).toBeTruthy("should add `GetConsultantAbsenceByQueryRequestQuery` object as query param");
	});

});
