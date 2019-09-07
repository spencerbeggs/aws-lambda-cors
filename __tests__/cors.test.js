import { cors } from "../src/index";

describe("Origin header handling", () => {
  let event;
  let context;
  let callback;
  let args;
  beforeEach(() => {
    event = {
      httpMethod: "POST",
      headers: {
        Origin: "https://foobar.com"
      }
    };
    context = {};
    callback = jest.fn();
    args = [event, context, callback];
  });
  it("sets response Access-Control-Allow-Origin header to '*' if all origins are allowed", () => {
    const { response } = cors(...args, {
      allowedOrigins: "*"
    });
    expect(response).toEqual(
      expect.objectContaining({
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
    );
  });
  it("sets allows a default Amplify request with default options ", () => {
    Object.assign(event.headers, {
      Accept: "application/json, text/plain, */*",
      Authorization: "foobar",
      DNT: "1",
      Referer: "foobar",
      "Sec-Fetch-Mode": "cors",
      "User-Agent": "foobar",
      "x-amz-date": "foobar",
      "X-Amz-Security-Token": "foobar"
    });
    let { response } = cors(...args);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
  });
  it("sets allows a default Amplify request with default options ", () => {
    Object.assign(event.headers, {
      Accept: "application/json, text/plain, */*",
      Authorization: "foobar",
      DNT: "1",
      Referer: "foobar",
      "Sec-Fetch-Mode": "cors",
      "User-Agent": "foobar",
      "x-amz-date": "foobar",
      "X-Amz-Security-Token": "foobar"
    });
    let { response } = cors(...args);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
  });
  it("returns 405 for a unallowed method", () => {
    let { response } = cors(...args, {
      allowedMethods: "PATCH"
    });
    expect(callback.mock.calls.length).toBe(1);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 405
      })
    );
  });
  it("returns 412 for a request with a not allowed header", () => {
    event.headers["X-Missing"] = "Error";
    let { response } = cors(...args);
    expect(callback.mock.calls.length).toBe(1);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 412
      })
    );
  });
  it("returns 412 for a non-CORS enabled request in strict mode", () => {
    let { response } = cors(...args, {
      allowedOrigins: "https://moobar.com"
    });
    expect(callback.mock.calls.length).toBe(1);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 412
      })
    );
  });
});
