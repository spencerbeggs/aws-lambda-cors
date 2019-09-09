import {
  AWS_HEADERS,
  CORS_SAFELISTED_HEADERS,
  FORBIDDEN_HEADERS,
  FORBIDDEN_WILDCARD_HEADERS
} from "./constants";
import { match, wildcards } from "./utilities";

export const createOriginHeader = (origin, allowedOrigins) => {
  if (allowedOrigins === "*") {
    return { "Access-Control-Allow-Origin": allowedOrigins };
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
    let safeHeaders = allowedHeaders.concat(
      CORS_SAFELISTED_HEADERS,
      FORBIDDEN_HEADERS,
      AWS_HEADERS
    );
    let confirmedHeaders = requestedHeaders.filter(
      header =>
        match(header, safeHeaders) || match(header, FORBIDDEN_WILDCARD_HEADERS)
    );
    if (confirmedHeaders.length) {
      headers["Access-Control-Allow-Headers"] = confirmedHeaders.join(", ");
    }
  }
  headers["Access-Control-Max-Age"] = maxAge;
  return headers;
};
