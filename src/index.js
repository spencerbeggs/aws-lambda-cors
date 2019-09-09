import {
  AWS_HEADERS,
  CORS_SAFELISTED_HEADERS,
  FORBIDDEN_HEADERS,
  FORBIDDEN_WILDCARD_HEADERS
} from "./constants";
import { Method, parseOptions } from "./utilities";
import { createOptionsHeader, createOriginHeader } from "./header";
import { match, matchStart } from "./utilities";

export const cors = (event, context, cb, opts = {}) => {
  let { allowedOrigins, allowedMethods, allowedHeaders, maxAge } = parseOptions(
    opts
  );
  let response = {
    statusCode: 200,
    headers: {}
  };
  let method = new Method(event.httpMethod);
  let METHOD = method;
  let headers = Object.keys(event.headers).reduce((acc, header) => {
    acc[header.toLowerCase()] = event.headers[header];
    return acc;
  }, {});
  let data = event.body || null;
  if (
    headers["content-type"] &&
    headers["content-type"].startsWith("application/json")
  ) {
    try {
      data = JSON.parse(data);
    } catch (err) {
      response.statusCode = 400;
      cb(null, response);
      cb = null;
    }
  }
  let origin = headers.origin;
  Object.assign(
    response.headers,
    createOriginHeader(origin, allowedOrigins, method.VERB, headers)
  );
  if (method.options) {
    response.statusCode = 204;
    let requestedHeaders = headers["access-control-request-headers"]
      ? headers["access-control-request-headers"]
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
    cb(null, response);
    cb = null;
  }
  let methodAllowed = match(method.verb, allowedMethods);
  if (cb && !methodAllowed) {
    response.statusCode = 405;
    cb(null, response);
    cb = null;
  }
  allowedHeaders = allowedHeaders.concat(
    CORS_SAFELISTED_HEADERS,
    FORBIDDEN_HEADERS,
    AWS_HEADERS
  );
  let disallowedHeaders = Object.keys(headers).every(
    header =>
      match(header, allowedHeaders) ||
      matchStart(header, FORBIDDEN_WILDCARD_HEADERS)
  );
  if (cb && !disallowedHeaders) {
    response.statusCode = 412;
    cb(null, response);
    cb = null;
  }

  return { event, context, callback: cb, response, data, method, METHOD };
};
