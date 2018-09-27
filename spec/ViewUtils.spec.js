const ViewUtils = require("../src/utils/ViewUtils");

describe("ViewUtils", () => {

    describe("getColorCodedTitle", () => {

        it("should color code POST endpoint", () => {
            const colorCodedTitle = ViewUtils.getColorCodedTitle("user-service.post-scopes");
            expect(colorCodedTitle).toBe("user-service.<span class=\"POST\">post</span>-scopes");
        });

        it("should color code GET endpoint", () => {
            const colorCodedTitle = ViewUtils.getColorCodedTitle("user-service.get-scopes");
            expect(colorCodedTitle).toBe("user-service.<span class=\"GET\">get</span>-scopes");
        });

        it("should color code PUT endpoint", () => {
            const colorCodedTitle = ViewUtils.getColorCodedTitle("user-service.put-scopes");
            expect(colorCodedTitle).toBe("user-service.<span class=\"PUT\">put</span>-scopes");
        });

        it("should color code DELETE endpoint", () => {
            const colorCodedTitle = ViewUtils.getColorCodedTitle("user-service.delete-scopes");
            expect(colorCodedTitle).toBe("user-service.<span class=\"DELETE\">delete</span>-scopes");
        });

    });

    it("addUnique should only add item to array if it doesn't exist", () => {
        const array = [];

        ViewUtils.addUnique({ subject: "hello", serviceName: "user-service" }, array);
        ViewUtils.addUnique({ subject: "hello2", serviceName: "user-service" }, array);
        ViewUtils.addUnique({ subject: "hello", serviceName: "user-service" }, array);

        expect(array.length).toBe(2);
    });

    it("replaceAll should replace all occurances of a string", () => {
        const string = "hello hello hello";
        const replacedString = ViewUtils.replaceAll(string, "hello", "yo");

        expect(replacedString).toBe("yo yo yo");
    });

    it("parseSubjectToAPIUrl should return method and url from inputted subject", () => {
        const { method, url } = ViewUtils.parseSubjectToAPIUrl("http.post.hello");

        expect(method).toBe("POST", "parsed method should be POST");
        expect(url).toBe("/hello", "parsed endpoint url should be /hello");
    });

    it("sortObject should return sort keys in an object alphabetically", () => {
        const sortedObject = ViewUtils.sortObject({ c: 3, a: 1, b: 2 });
        const keys = Object.keys(sortedObject);

        expect(keys[0]).toBe("a");
        expect(keys[1]).toBe("b");
        expect(keys[2]).toBe("c");
    });

    it("sortedForEach sort inputted array and loop through it", () => {
        const obj = { c: 3, a: 1, b: 2 };
        const keys = Object.keys(obj);
        const loopedValues = [];

        ViewUtils.sortedForEach(obj, (value, key, i) => loopedValues.push(key));

        expect(loopedValues[0]).toBe("a");
        expect(loopedValues[1]).toBe("b");
        expect(loopedValues[2]).toBe("c");
    });

});