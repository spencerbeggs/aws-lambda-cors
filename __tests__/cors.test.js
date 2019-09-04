import {
  createCORSHeader,
  createOriginHeader,
  parseOptions
} from "../src/header";

import { cors } from "../src/index";

describe("CORS", () => {
  describe("Options handling", () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      delete process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });
    it("returns default values if no options are passed", () => {
      const options = parseOptions();
      expect(options).toMatchObject({
        allowedOrigins: "*",
        allowedMethods: ["GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token"
        ],
        maxAge: "600",
        strict: true
      });
    });
    it("returns overridden values when options are passed", () => {
      const options = parseOptions({
        allowedOrigins: ["https://foobar.com"],
        allowedMethods: ["PATCH", "DELETE"],
        allowedHeaders: ["X-Foo", "X-Bar"],
        maxAge: "200",
        strict: false
      });
      expect(options).toMatchObject({
        allowedOrigins: ["https://foobar.com"],
        allowedMethods: ["PATCH", "DELETE"],
        allowedHeaders: ["X-Foo", "X-Bar"],
        maxAge: "200",
        strict: false
      });
    });

    it("parses comma-seperated string value of opts.allowedOrigins into an array unless it is *", () => {
      const stringOptions = parseOptions({
        allowedOrigins: "https://foobar.com,https://moobar.com"
      });
      expect(stringOptions).toEqual(
        expect.objectContaining({
          allowedOrigins: ["https://foobar.com", "https://moobar.com"]
        })
      );
      const starOptions = parseOptions({
        allowedOrigins: "*"
      });
      expect(starOptions).toEqual(
        expect.objectContaining({
          allowedOrigins: "*"
        })
      );
    });
    it("parses comma-seperated string value of opts.allowedMethods into an array", () => {
      const options = parseOptions({
        allowedMethods: "PUT,POST"
      });
      expect(options).toEqual(
        expect.objectContaining({
          allowedMethods: ["PUT", "POST"]
        })
      );
    });
    it("parses comma-seperated string value of opts.allowedHeaders into an array", () => {
      const options = parseOptions({
        allowedHeaders: "X-Foo,X-Bar"
      });
      expect(options).toEqual(
        expect.objectContaining({
          allowedHeaders: ["X-Foo", "X-Bar"]
        })
      );
    });
    it("accepts array values for opts.allowedOrigins from process.env.CORS_ALLOWED_ORIGINS", () => {
      process.env.CORS_ALLOWED_ORIGINS = [
        "https://foobar.com",
        "https://moobar.com"
      ];
      const options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          allowedOrigins: ["https://foobar.com", "https://moobar.com"]
        })
      );
    });
    it("accepts comma-seperated string value for opts.allowedOrigins from process.env.CORS_ALLOWED_ORIGINS", () => {
      process.env.CORS_ALLOWED_ORIGINS =
        "https://foobar.com,https://moobar.com";
      const options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          allowedOrigins: ["https://foobar.com", "https://moobar.com"]
        })
      );
    });
    it("accepts array values for opts.allowedMethods from process.env.CORS_ALLOWED_METHODS", () => {
      process.env.CORS_ALLOWED_METHODS = ["PUT", "POST"];
      const options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          allowedMethods: ["PUT", "POST"]
        })
      );
    });
    it("accepts comma-seperated string value for opts.allowedMethods from process.env.CORS_ALLOWED_METHODS", () => {
      process.env.CORS_ALLOWED_METHODS = "PUT,POST";
      const options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          allowedMethods: ["PUT", "POST"]
        })
      );
    });
    it("accepts array values for opts.allowedHeaders from process.env.CORS_ALLOWED_HEADERS", () => {
      process.env.CORS_ALLOWED_HEADERS = ["X-Foo", "X-Bar"];
      const options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          allowedHeaders: ["X-Foo", "X-Bar"]
        })
      );
    });
    it("accepts comma-seperated string value for opts.allowedHeaders from process.env.CORS_ALLOWED_HEADERS", () => {
      process.env.CORS_ALLOWED_HEADERS = "X-Foo,X-Bar";
      const options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          allowedHeaders: ["X-Foo", "X-Bar"]
        })
      );
    });
    it("accepts string value for opts.maxAge from process.env.CORS_MAX_AGE", () => {
      process.env.CORS_MAX_AGE = "200";
      const options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          maxAge: "200"
        })
      );
    });
    it("accepts string true/false or boolean opts.strict from process.env.CORS_STRICT", () => {
      process.env.CORS_STRICT = "true";
      let options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          strict: true
        })
      );
      process.env.CORS_STRICT = "false";
      options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          strict: false
        })
      );
      process.env.CORS_STRICT = true;
      options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          strict: true
        })
      );
      process.env.CORS_STRICT = false;
      options = parseOptions();
      expect(options).toEqual(
        expect.objectContaining({
          strict: false
        })
      );
    });
    it("omits invalid properties from parsed object", () => {
      const options = parseOptions({
        foo: "bar"
      });
      expect(options).toMatchObject({
        allowedOrigins: "*",
        allowedMethods: ["GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token"
        ],
        maxAge: "600",
        strict: true
      });
    });
  });
  describe("Basic header handling", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      delete process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it("it returns an empty object if origin is missing", () => {
      let result = createOriginHeader(undefined, ["https://www.example.com"]);
      expect(result).toMatchObject({});
    });

    it("it compiles wildcards", () => {
      let result = createOriginHeader("https://www.example.com", [
        "https://*.example.com"
      ]);
      expect(result).toMatchObject({
        "Access-Control-Allow-Origin": "https://www.example.com"
      });
    });

    it("it returns an empty object if origin is not allowed", () => {
      let result = createOriginHeader("https://foo.com", ["https://bar.com"]);
      expect(result).toMatchObject({});
    });

    it("it uses process.env.CORS_ALLOWED_ORIGINS if allowedOrigins is not passed", () => {
      process.env.CORS_ALLOWED_ORIGINS = ["https://foo.com"];
      let result = createOriginHeader("https://foo.com");
      expect(result).toMatchObject({
        "Access-Control-Allow-Origin": "https://foo.com"
      });
    });

    it("it splits allowedOrigins into an array if a string is passed", () => {
      process.env.CORS_ALLOWED_ORIGINS = "https://foo.com,https://bar.com";
      expect(createOriginHeader("https://foo.com")).toMatchObject({
        "Access-Control-Allow-Origin": "https://foo.com"
      });
      expect(createOriginHeader("https://bar.com")).toMatchObject({
        "Access-Control-Allow-Origin": "https://bar.com"
      });
    });

    it("it uses a wildcard origin if neither process.env.CORS_ORIGINS nor allowedOrigins is not passed", () => {
      let result = createOriginHeader("https://foo.com");
      expect(result).toMatchObject({
        "Access-Control-Allow-Origin": "*"
      });
    });
  });

  describe("Preflight header handling", () => {
    const OLD_ENV = process.env;
    let event,
      context,
      callback,
      options = {
        allowedOrigins: "https://foobar.com"
      };

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      delete process.env.NODE_ENV;
      context = {};
      event = {
        httpMethod: "OPTIONS",
        path: "/foobar",
        headers: {
          Origin: "https://foobar.com"
        }
      };
      callback = jest.fn();
      //console.log = jest.fn();
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it("it calls back with a 204 response if the HTTP method is OPTIONS", () => {
      cors(event, context, callback, options);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          statusCode: 204,
          headers: expect.objectContaining({
            "Access-Control-Allow-Origin": "https://foobar.com"
          })
        })
      );
    });

    it("it ignores case of Origin header", () => {
      delete event.headers.Origin;
      event.headers.origin = "https://foobar.com";
      cors(event, context, callback, options);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          statusCode: 204,
          headers: expect.objectContaining({
            "Access-Control-Allow-Origin": "https://foobar.com"
          })
        })
      );
    });
  });

  describe("Event handling", () => {
    let event, context, callback;

    beforeEach(() => {
      context = {};
      event = {
        httpMethod: "POST",
        path: "/foobar",
        headers: {
          Origin: "https://foobar.com"
        }
      };
      callback = jest.fn();
      console.log = jest.fn();
    });

    it("it sets Access-Control-Allow-Headers if opts.allowedHeaders is passed as an array", () => {
      const { response } = cors(event, context, callback, {
        allowedHeaders: ["X-Foo", "X-Bar"]
      });
      expect(callback.mock.calls.length).toBe(0);
      expect(response).toEqual(
        expect.objectContaining({
          statusCode: 200,
          headers: expect.objectContaining({
            "Access-Control-Allow-Headers": "X-Foo,X-Bar"
          })
        })
      );
    });

    it("it sets Access-Control-Allow-Methods if opts.allowedMethods is passed", () => {
      let result = createCORSHeader("https://foo.com", {
        allowedMethods: ["GET", "DELETE"]
      });
      expect(result).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Methods": "GET,DELETE"
        })
      );
    });

    it("it sets Access-Control-Max-Age header on OPTIONS if opts.maxAge option is passed", () => {
      let result = createCORSHeader("https://foo.com", {
        maxAge: "200"
      });
      expect(result).toEqual(
        expect.objectContaining({
          "Access-Control-Max-Age": "200"
        })
      );
    });

    it("it uses process.env.CORS_ALLOWED_HEADERS env variable is set", () => {
      process.env.CORS_ALLOWED_HEADERS = ["X-Foobar", "X-Baz"];
      let result = createCORSHeader("https://foo.com");
      expect(result).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Headers": "X-Foobar,X-Baz"
        })
      );
    });

    it("it splits allowedHeaders into an array if a string is passed", () => {
      process.env.CORS_ALLOWED_HEADERS = "X-Foobar,X-Baz";
      let result = createCORSHeader("https://foo.com");
      expect(result).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Headers": "X-Foobar,X-Baz"
        })
      );
    });

    it("it uses process.env.CORS_ALLOWED_METHODS env variable is set", () => {
      process.env.CORS_ALLOWED_METHODS = ["PUT", "DELETE"];
      let result = createCORSHeader("https://foo.com");
      expect(result).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Methods": "PUT,DELETE"
        })
      );
    });

    it("it splits allowedMethods into an array if a string is passed", () => {
      process.env.CORS_ALLOWED_METHODS = "PUT,DELETE";
      let result = createCORSHeader("https://foo.com");
      expect(result).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Methods": "PUT,DELETE"
        })
      );
    });

    it("it parses the body of the request into a JSON object if Content-Type header contains 'application/json'", () => {
      event.headers["Content-Type"] = "application/json";
      event.body = '{"foo": "bar"}';
      let result = cors(event, context, callback);
      expect(callback.mock.calls.length).toBe(0);
      expect(result).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            foo: "bar"
          })
        })
      );
    });

    it("it returns the raw event.body as data if it cannot be parsed as JSON when Content-Type header contains 'application/json'", () => {
      event.headers["Content-Type"] = "application/json";
      event.body = "brokenJson";
      let result = cors(event, context, callback);
      expect(callback.mock.calls.length).toBe(0);
      expect(result).toEqual(
        expect.objectContaining({
          data: event.body
        })
      );
      expect(console.log.mock.calls.length).toBe(1);
    });

    it("it returns a response object, original event, original context, original callback and data", () => {
      let result = cors(event, context, callback);
      expect(callback.mock.calls.length).toBe(0);
      expect(result).toEqual(
        expect.objectContaining({
          response: expect.objectContaining({
            statusCode: 200
          }),
          callback: callback,
          context: context,
          event: event,
          data: null
        })
      );
    });

    it("it accepts an options object { allowedOrigins, allowedMethods, allowedHeaders, maxAge }", () => {
      event.httpMethod = "OPTIONS";
      cors(event, context, callback, {
        allowedOrigins: "https://foobar.com",
        allowedMethods: ["PUT", "PATCH"],
        allowedHeaders: "X-Allowed",
        maxAge: "333"
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          statusCode: 204,
          headers: expect.objectContaining({
            "Access-Control-Allow-Origin": "https://foobar.com",
            "Access-Control-Allow-Methods": "PUT,PATCH",
            "Access-Control-Allow-Headers": "X-Allowed",
            "Access-Control-Max-Age": "333"
          })
        })
      );
    });

    it("returns a 401 response if the allowed origin does not match", () => {
      cors(event, context, callback, {
        allowedOrigins: "https://anothersite.com"
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          statusCode: 401
        })
      );
    });
  });
});
