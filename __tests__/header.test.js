import { createOptionsHeader, createOriginHeader } from "../src/header";

describe("Origin header processing", () => {
  it("it sets Access-Control-Allow-Origin to * if allowedOrigins is *", () => {
    let header = createOriginHeader("https://foobar.com", "*");
    expect(header).toMatchObject({
      "Access-Control-Allow-Origin": "*"
    });
  });
  it("it sets sets Access-Control-Allow-Origin if the origin is allowedr", () => {
    let header = createOriginHeader("https://foo.bar.com", [
      "https://foo.bar.com"
    ]);
    expect(header).toMatchObject({
      "Access-Control-Allow-Origin": "https://foo.bar.com"
    });
  });
  it("it doesn't set Access-Control-Allow-Origin origin is not allowd", () => {
    let header = createOriginHeader("https://foobar.com", [
      "https://moobar.com"
    ]);
    expect(header["Access-Control-Allow-Origin"]).toBeUndefined();
  });
  it("it doesn't set Access-Control-Allow-Origin if not origin is provided", () => {
    let header = createOriginHeader(undefined, ["https://foobar.com"]);
    expect(header["Access-Control-Allow-Origin"]).toBeUndefined();
  });
  it("it sets Access-Control-Allow-Origin with wildcards in the Origin URI", () => {
    let header = createOriginHeader("https://foo.bar.com", [
      "https://*.bar.com"
    ]);
    expect(header).toMatchObject({
      "Access-Control-Allow-Origin": "https://foo.bar.com"
    });
  });
  it("it confirms Access-Control-Requested-Headers with Access-Control-Allow-Headers", () => {
    let header = createOptionsHeader(["X-Foo"], ["GET"], "600", ["X-Foo"]);
    expect(header).toMatchObject({
      "Access-Control-Allow-Headers": "X-Foo"
    });
  });
  it("doesn't set Access-Control-Allow-Headers if there are no Access-Control-Requested-Headers", () => {
    let header = createOptionsHeader([], ["GET"], "600", []);
    expect(header).toMatchObject({
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Max-Age": "600"
    });
  });
  it("doesn't set Access-Control-Allow-Headers if no matches from Access-Control-Requested-Headers", () => {
    let header = createOptionsHeader(["X-Foo"], ["GET"], "600", ["X-Bar"]);
    expect(header).toMatchObject({
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Max-Age": "600"
    });
  });
  it("allows an COR Forbibben headers Access-Control-Requested-Headers with Access-Control-Allow-Headers", () => {
    let header = createOptionsHeader(["X-Foo"], ["GET"], "600", [
      "X-Foo",
      "Data",
      "Sec-Foobar",
      "Proxy-Foobar"
    ]);
    expect(header).toMatchObject({
      "Access-Control-Allow-Headers": "X-Foo"
    });
  });
});
