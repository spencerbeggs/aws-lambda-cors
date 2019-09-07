import {
  CORS_SAFELISTED_HEADERS,
  FORBIDDEN_HEADERS,
  FORBIDDEN_WILDCARD_HEADERS
} from "./constants";
import {
  createOptionsHeader,
  createOriginHeader,
  parseOptions
} from "./header";
import { match, matchStart } from "./utilities";

import { Method } from "./utilities";

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
  let METHOD = method;
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
      callback = null;
    }
  }
  let methodAllowed = match(method.verb, allowedMethods);
  if (callback && !methodAllowed) {
    response.statusCode = 405;
    callback(null, response);
    callback = null;
  }
  allowedHeaders = allowedHeaders.concat(
    CORS_SAFELISTED_HEADERS,
    FORBIDDEN_HEADERS
  );
  let headersAllowed = Object.keys(lowerCaseHeaders)
    .filter(
      lowerCaseHeader =>
        !matchStart(lowerCaseHeader, FORBIDDEN_WILDCARD_HEADERS)
    )
    .reduce((acc, header) => {
      if (acc !== false) {
        acc = match(header, allowedHeaders);
      }
      return acc;
    }, true);
  if (callback && !headersAllowed) {
    response.statusCode = 412;
    callback(null, response);
    callback = null;
  }
  if (
    callback &&
    !response.headers.hasOwnProperty("Access-Control-Allow-Origin") &&
    strict
  ) {
    response.statusCode = 412;
    callback(null, response);
    callback = null;
  }

  return { event, context, callback, response, data, method, METHOD };
};
