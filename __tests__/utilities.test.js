import { Method, match, matchStart, parseOptions } from "../src/utilities";

describe("Matching", () => {
  it("match confirms a lowercase needle is in an uppercase haystack", () => {
    let result = match("post", ["GET", "POST"]);
    expect(result).toBe(true);
  });
  it("match confirms a an uppercase needle is in a lowercase haystack", () => {
    let result = match("POST", ["get", "post"]);
    expect(result).toBe(true);
  });
  it("match doesn't find a missing lowercase needle in an uppercase collection", () => {
    let result = match("post", ["GET", "PATCH"]);
    expect(result).toBe(false);
  });
  it("match doesn't find a missing uppercase needle in a lowercase collection", () => {
    let result = match("post", ["GET", "PATCH"]);
    expect(result).toBe(false);
  });
  it("matchStart confirms a lowercase needle missing in an uppercase collection", () => {
    let result = matchStart("sec-foo", ["Sec-Foo", "Proxy-Bar"]);
    expect(result).toBe(true);
  });
  it("matchStart confirms an uppercase needle an lowercase collection", () => {
    let result = matchStart("Sec-Foo", ["sec-foo", "proxy-bar"]);
    expect(result).toBe(true);
  });
  it("matchStart doesn't find a missing lowercase needle missing in an uppercase collection", () => {
    let result = matchStart("sec-foo", ["Proxy-Bar"]);
    expect(result).toBe(false);
  });
  it("matchStart doesn't find a missing uppercase needle an lowercase collection", () => {
    let result = matchStart("Proxy-Foo", ["sec-bar"]);
    expect(result).toBe(false);
  });
});

describe("Method helpers", () => {
  const methods = {
    get: "GET",
    head: "HEAD",
    post: "POST",
    put: "PUT",
    delete: "DELETE",
    connect: "CONNECT",
    options: "OPTIONS",
    trace: "TRACE",
    patch: "PATCH"
  };
  let method;
  Object.entries(methods).forEach(entry => {
    it("method[verb] METHOD[verb] returns true for case-insensative passed to constructor and false for all others", () => {
      let [lowercaseVerb, uppercaseVerb] = entry;
      method = new Method(lowercaseVerb);
      let otherLowerCaseMethods = Object.keys(methods).filter(
        method => method !== lowercaseVerb
      );
      let otherUpperCaseMethods = Object.values(methods).filter(
        method => method !== uppercaseVerb
      );
      expect(method[lowercaseVerb]).toBe(true);
      expect(method[uppercaseVerb]).toBe(true);
      expect(method.is(lowercaseVerb)).toBe(true);
      otherLowerCaseMethods.forEach(lowerCaseMethod => {
        expect(method[lowerCaseMethod]).toBe(false);
        expect(method.is(lowerCaseMethod)).toBe(false);
        expect(method.not(lowerCaseMethod)).toBe(true);
      });
      otherUpperCaseMethods.forEach(upperCaseMethod => {
        expect(method[upperCaseMethod]).toBe(false);
        expect(method.IS(upperCaseMethod)).toBe(false);
        expect(method.NOT(upperCaseMethod)).toBe(true);
      });
    });
  });
});

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
    process.env.CORS_ALLOWED_ORIGINS = "https://foobar.com,https://moobar.com";
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
