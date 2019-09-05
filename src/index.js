import { CORS_SAFELISTED_HEADERS, FORBIDDEN_HEADERS } from "./constants";
import {
  createOptionsHeader,
  createOriginHeader,
  parseOptions
} from "./header";

class Method {
  constructor(httpMethod) {
    this.httpMethod = httpMethod;
  }
  get get() {
    return this.httpMethod === "GET" || this.httpMethod === "GET";
  }
  get head() {
    return this.httpMethod === "HEAD" || this.httpMethod === "head";
  }
  get post() {
    return this.httpMethod === "POST" || this.httpMethod === "post";
  }
  get put() {
    return this.httpMethod === "PUT" || this.httpMethod === "put";
  }
  get delete() {
    return this.httpMethod === "DELETE" || this.httpMethod === "delete";
  }
  get connect() {
    return this.httpMethod === "CONNECT" || this.httpMethod === "connect";
  }
  get options() {
    return this.httpMethod === "OPTIONS" || this.httpMethod === "options";
  }
  get trace() {
    return this.httpMethod === "TRACE" || this.httpMethod === "trace";
  }
  get patch() {
    return this.httpMethod === "PATCH" || this.httpMethod === "patch";
  }
  is(val) {
    return this.httpMethod.toLowerCase() === val.toLowerCase();
  }
  not(val) {
    return this.httpMethod.toLowerCase() !== val.toLowerCase();
  }
}

class MethodENUM {
  constructor(httpMethod) {
    this.httpMethod = httpMethod;
  }
  get GET() {
    return this.httpMethod === "GET" || this.httpMethod === "GET";
  }
  get HEAD() {
    return this.httpMethod === "HEAD" || this.httpMethod === "head";
  }
  get POST() {
    return this.httpMethod === "POST" || this.httpMethod === "post";
  }
  get PUT() {
    return this.httpMethod === "PUT" || this.httpMethod === "put";
  }
  get DELETE() {
    return this.httpMethod === "DELETE" || this.httpMethod === "delete";
  }
  get CONNECT() {
    return this.httpMethod === "CONNECT" || this.httpMethod === "connect";
  }
  get OPTIONS() {
    return this.httpMethod === "OPTIONS" || this.httpMethod === "options";
  }
  get TRACE() {
    return this.httpMethod === "TRACE" || this.httpMethod === "trace";
  }
  get PATCH() {
    return this.httpMethod === "PATCH" || this.httpMethod === "patch";
  }
  IS(val) {
    return this.httpMethod.toUpperCase() === val.toUpperCase();
  }
  NOT(val) {
    return this.httpMethod.toUpperCase() !== val.toUpperCase();
  }
}

export const cors = (event, context, callback, opts = {}) => {
  let {
    allowedOrigins,
    allowedMethods,
    allowedHeaders,
    maxAge,
    strict
  } = parseOptions(opts);
  let response = {
    statusCode: 200,
    headers: {}
  };
  let method = new Method(event.httpMethod);
  let METHOD = new MethodENUM(event.httpMethod);
  let lowerCaseHeaders = Object.keys(event.headers).reduce((acc, header) => {
    acc[header.toLowerCase()] = event.headers[header];
    return acc;
  }, {});
  let data = event.body || null;
  let origin = lowerCaseHeaders.origin;
  if (origin) {
    Object.assign(response.headers, createOriginHeader(origin, allowedOrigins));
  }
  if (method.options) {
    response.statusCode = 204;
    let requestedHeaders = lowerCaseHeaders["access-control-request-headers"]
      ? lowerCaseHeaders["access-control-request-headers"]
          .split(",")
          .map(value => value.trim())
      : [];
    Object.assign(
      response.headers,
      createOptionsHeader(
        allowedHeaders,
        allowedMethods,
        maxAge,
        requestedHeaders
      )
    );
    callback(null, response);
    callback = null;
  }
  if (
    lowerCaseHeaders["content-type"] &&
    lowerCaseHeaders["content-type"].startsWith("application/json")
  ) {
    try {
      data = JSON.parse(data);
    } catch (err) {
      response.statusCode = 400;
      callback(null, response);
    }
  }
  let methodAllowed = allowedMethods.reduce((acc, allowedMethod) => {
    if (acc !== true) {
      acc =
        allowedMethod.toUpperCase() == method.httpMethod ||
        allowedMethod.toLowerCase() === method.httpMethod;
    }
    return acc;
  }, false);
  if (!methodAllowed) {
    response.statusCode = 405;
    callback(null, response);
    callback = null;
  }
  let headersAllowed = allowedHeaders
    .concat(CORS_SAFELISTED_HEADERS, FORBIDDEN_HEADERS)
    .reduce((acc, header) => {
      if (acc !== false) {
        acc = Object.keys(lowerCaseHeaders).includes(header.toLowerCase());
      }
      return acc;
    }, true);
  if (!headersAllowed) {
    response.statusCode = 412;
    callback(null, response);
    callback = null;
  }
  if (!response.headers["Access-Control-Allow-Origin"] && strict) {
    response.statusCode = 412;
    callback(null, response);
    callback = null;
  }

  return { event, context, callback, response, data, method, METHOD };
};
