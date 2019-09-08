import {
  CONTENT_TYPE_ALLOWED_VALUES,
  CORS_SAFELISTED_HEADERS,
  FORBIDDEN_HEADERS,
  FORBIDDEN_WILDCARD_HEADERS
} from "./constants";
import { match, matchStart, wildcards } from "./utilities";

export const isSimpleRequest = (method, requestedHeaders) => {
  let allowedMethods = ["GET", "HEAD", "POST"];
  let headerNames = Object.keys(requestedHeaders);
  if (!match(method, allowedMethods)) {
    return false;
  }
  headerNames = headerNames.filter(header =>
    matchStart(header, FORBIDDEN_WILDCARD_HEADERS)
  );
  let allowedHeaders = headerNames.concat(
    CORS_SAFELISTED_HEADERS,
    FORBIDDEN_HEADERS
  );
  let isAllowed =
    headerNames.map(header => !match(header, allowedHeaders)).length === 0;
  let contentType = requestedHeaders["content-type"];
  if (contentType) {
    isAllowed = match(contentType, CONTENT_TYPE_ALLOWED_VALUES);
  }
  return isAllowed;
};

export const createOriginHeader = (
  origin,
  allowedOrigins,
  method,
  requestedHeaders
) => {
  if (allowedOrigins === "*") {
    return { "Access-Control-Allow-Origin": allowedOrigins };
  }
  if (isSimpleRequest(method, requestedHeaders) && !origin) {
    return { "Access-Control-Allow-Origin": "*" };
  }
  if (!origin) {
    return {};
  }
  let allowedPatterns = allowedOrigins.map(wildcards);
  let isAllowed = allowedPatterns.some(pattern => origin.match(pattern));
  if (isAllowed) {
    return { "Access-Control-Allow-Origin": origin };
  } else {
    return {};
  }
};

export const createOptionsHeader = (
  allowedHeaders,
  allowedMethods,
  maxAge,
  requestedHeaders
) => {
  let headers = {
    "Access-Control-Allow-Methods": allowedMethods.join(",")
  };
  if (requestedHeaders.length) {
    requestedHeaders = requestedHeaders.filter(
      header => !match(header, FORBIDDEN_WILDCARD_HEADERS)
    );
    let confirmedHeaders = allowedHeaders
      .concat(CORS_SAFELISTED_HEADERS, FORBIDDEN_HEADERS)
      .reduce((acc, header) => {
        if (match(header, requestedHeaders)) {
          acc.push(header);
        }
        return acc;
      }, []);
    if (confirmedHeaders.length) {
      headers["Access-Control-Allow-Headers"] = confirmedHeaders.join(", ");
    }
  }
  headers["Access-Control-Max-Age"] = maxAge;
  return headers;
};
