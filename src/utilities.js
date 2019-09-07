export const match = (value, collection) =>
  collection.some(target => value.toLowerCase() === target.toLowerCase());

export const matchStart = (value, collection) =>
  collection.some(target =>
    value.toLowerCase().startsWith(target.toLowerCase())
  );
export class Method {
  constructor(verb) {
    this.verb = verb.toLowerCase();
    this.VERB = verb.toUpperCase();
  }
  get get() {
    return match("get", [this.verb, this.VERB]);
  }
  get head() {
    return match("head", [this.verb, this.VERB]);
  }
  get post() {
    return match("post", [this.verb, this.VERB]);
  }
  get put() {
    return match("put", [this.verb, this.VERB]);
  }
  get delete() {
    return match("delete", [this.verb, this.VERB]);
  }
  get connect() {
    return match("connect", [this.verb, this.VERB]);
  }
  get options() {
    return match("options", [this.verb, this.VERB]);
  }
  get trace() {
    return match("trace", [this.verb, this.VERB]);
  }
  get patch() {
    return match("patch", [this.verb, this.VERB]);
  }
  get GET() {
    return match("GET", [this.verb, this.VERB]);
  }
  get HEAD() {
    return match("HEAD", [this.verb, this.VERB]);
  }
  get POST() {
    return match("POST", [this.verb, this.VERB]);
  }
  get PUT() {
    return match("PUT", [this.verb, this.VERB]);
  }
  get DELETE() {
    return match("DELETE", [this.verb, this.VERB]);
  }
  get CONNECT() {
    return match("CONNECT", [this.verb, this.VERB]);
  }
  get OPTIONS() {
    return match("OPTIONS", [this.verb, this.VERB]);
  }
  get TRACE() {
    return match("TRACE", [this.verb, this.VERB]);
  }
  get PATCH() {
    return match("PATCH", [this.verb, this.VERB]);
  }
  is(val) {
    return this.verb === val.toLowerCase();
  }
  not(val) {
    return this.verb !== val.toLowerCase();
  }
  IS(val) {
    return this.VERB === val.toUpperCase();
  }
  NOT(val) {
    return this.VERB !== val.toUpperCase();
  }
}
