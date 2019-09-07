import { Method, match, matchStart } from "../src/utilities";

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
