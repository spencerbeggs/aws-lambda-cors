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
  it("accepts wildcards in Origin URIs", () => {
    event.headers.Origin = "https://foo.bar.com";
    let { response } = cors(...args, {
      allowedOrigins: "https://*.bar.com"
    });
    expect(response).toEqual(
      expect.objectContaining({
        headers: {
          "Access-Control-Allow-Origin": "https://foo.bar.com"
        }
      })
    );
  });
  it("response with a 204 for an OPTIONS request", () => {
    event.httpMethod = "OPTIONS";
    let { response } = cors(...args);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 204,
        headers: expect.objectContaining({
          "Access-Control-Allow-Origin": "*"
        })
      })
    );
  });
  it("confirms Access-Control-Request-Headers on OPTIONS request", () => {
    event.httpMethod = "OPTIONS";
    Object.assign(event.headers, {
      "Access-Control-Request-Headers": "X-Foo"
    });
    let { response } = cors(...args, {
      allowedHeaders: "X-Foo"
    });
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 204,
        headers: expect.objectContaining({
          "Access-Control-Allow-Headers": "X-Foo",
          "Access-Control-Allow-Origin": "*"
        })
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
  it("returns parses the event body into JSON if the request Content-Type starts with application/json", () => {
    Object.assign(event.headers, {
      "Content-Type": "application/json; charset=utf-8"
    });
    event.body = '{"foo":"bar"}';
    let { response, data } = cors(...args);
    expect(callback.mock.calls.length).toBe(0);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    );
    expect(data).toMatchObject({
      foo: "bar"
    });
  });
  it("it doesn't  return an Access-Control-Allow-Origin header if there is no Origin in the request headers", () => {
    delete event.headers["Origin"];
    let { response } = cors(...args);
    expect(response.headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });
  it("it returns calls back with 400 if if cannot parse the event body into JSON object when the request Content-Type starts with application/json", () => {
    Object.assign(event.headers, {
      "Content-Type": "application/json; charset=utf-8"
    });
    let brokenJson = "{foo:bar}";
    event.body = brokenJson;
    let { response, data } = cors(...args);
    expect(callback.mock.calls.length).toBe(1);
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 400
      })
    );
    expect(data).toEqual(brokenJson);
  });
});
