import { parseOptions } from "../src/header";

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
