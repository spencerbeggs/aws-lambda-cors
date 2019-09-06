import { match, matchStart } from "../src/header";

describe("Utilities", () => {
  it("match locates a lowercase needle in an uppercase stack", () => {
    let result = match("post", ["GET", "POST"]);
    expect(result).toBe(true);
  });
  it("match won't locates a needle missing in the collection", () => {
    let result = match("post", ["GET", "PATCH"]);
    expect(result).toBe(false);
  });
  it("match locates an uppercase needle in a lowercase stack", () => {
    let result = match("POST", ["get", "post"]);
    expect(result).toBe(true);
  });
});
