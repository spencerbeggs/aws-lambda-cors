import { createOriginHeader, createPreflightResponse } from "../src/header";
import { cors } from "../src/index";

describe("CORS", () => {
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

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
      delete process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it("it sets max age header if option is passed", () => {
      let result = createPreflightResponse("https://foo.com", {
        maxAge: "200"
      });
      expect(result).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Access-Control-Max-Age": "200"
          })
        })
      );
    });

    it("it uses process.env.CORS_ALLOWED_HEADERS env variable is set", () => {
      process.env.CORS_ALLOWED_HEADERS = ["X-Foobar", "X-Baz"];
      let result = createPreflightResponse("https://foo.com");
      expect(result).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Access-Control-Allow-Headers": "X-Foobar,X-Baz"
          })
        })
      );
    });

    it("it splits allowedHeaders into an array if a string is passed", () => {
      process.env.CORS_ALLOWED_HEADERS = "X-Foobar,X-Baz";
      let result = createPreflightResponse("https://foo.com");
      expect(result).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Access-Control-Allow-Headers": "X-Foobar,X-Baz"
          })
        })
      );
    });

    it("it uses process.env.CORS_ALLOWED_METHODS env variable is set", () => {
      process.env.CORS_ALLOWED_METHODS = ["PUT", "DELETE"];
      let result = createPreflightResponse("https://foo.com");
      expect(result).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Access-Control-Allow-Methods": "PUT,DELETE"
          })
        })
      );
    });

    it("it splits allowedMethods into an array if a string is passed", () => {
      process.env.CORS_ALLOWED_METHODS = "PUT,DELETE";
      let result = createPreflightResponse("https://foo.com");
      expect(result).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Access-Control-Allow-Methods": "PUT,DELETE"
          })
        })
      );
    });
  });

  describe("Event handling", () => {
    let callback, event;

    beforeEach(() => {
      event = {
        httpMethod: "POST",
        path: "/foobar",
        headers: {
          Origin: "https://foobar.com"
        }
      };
      callback = jest.fn();
    });

    it("it callsback with a 204 response if the HTTP method is OPTIONS", () => {
      event.httpMethod = "OPTIONS";
      cors(event, callback);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          statusCode: 204
        })
      );
    });

    it("it ignores case of Origin header", () => {
      delete event.headers.Origin;
      event.headers.origin = "https://foobar.com";
      let result = cors(event, callback);
      expect(callback.mock.calls.length).toBe(0);
      expect(result).toEqual(
        expect.objectContaining({
          response: expect.objectContaining({
            headers: expect.objectContaining({
              "Access-Control-Allow-Origin": "*"
            })
          })
        })
      );
    });

    it("it parses the body of the request into a JSON object if Content-Type header contains 'application/json'", () => {
      event.headers["Content-Type"] = "application/json";
      event.body = '{"foo": "bar"}';
      let result = cors(event, callback);
      expect(callback.mock.calls.length).toBe(0);
      expect(result).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            foo: "bar"
          })
        })
      );
    });

    it("it returns the raw event body as data if it cannot be parsed as JSON when Content-Type header contains 'application/json'", () => {
      event.headers["Content-Type"] = "application/json";
      event.body = '{"foo: "bar"}';
      console.log = jest.fn();
      let result = cors(event, callback);
      expect(callback.mock.calls.length).toBe(0);
      expect(result).toEqual(
        expect.objectContaining({
          data: event.body
        })
      );
      expect(console.log.mock.calls.length).toBe(1);
    });

    it("it returns a response object, original event, and original callback", () => {
      let result = cors(event, callback);
      expect(callback.mock.calls.length).toBe(0);
      expect(result).toEqual(
        expect.objectContaining({
          response: expect.objectContaining({
            statusCode: 200
          }),
          callback: callback,
          event: event
        })
      );
    });
  });
});