import {
  CORS_SAFELISTED_HEADERS,
  DEFAULT_ALLOWED_HEADERS,
  DEFAULT_ALLOWED_METHODS,
  FORBIDDEN_HEADERS,
  FORBIDDEN_WILDCARD_HEADERS
} from "./constants";

export function match(value, collection) {
  return collection.some(target => {
    value.toLowerCase() === target.toLowerCase() ||
      value.toUpperCase() === target.toUpperCase();
  });
}

export function matchStart(value, collection) {
  return collection.some(target => {
    value.toLowerCase().startsWith(target.toLowerCase()) ||
      value.toUpperCase().startsWith(target.toUpperCase());
  });
}

export const wildcards = url => {
  const urlUnreservedPattern = "[A-Za-z0-9-._~]";
  const wildcardPattern = urlUnreservedPattern + "*";
  const parts = url.split("*");
  const escapeRegex = str => str.replace(/([.?*+^$(){}|[\-\]\\])/g, "\\$1");
  const escaped = parts.map(escapeRegex);
  return new RegExp("^" + escaped.join(wildcardPattern) + "$");
};

export const parseOptions = (opts = {}) => {
  const validKeys = [
    "allowedOrigins",
    "allowedMethods",
    "allowedHeaders",
    "maxAge",
    "strict"
  ];
  for (let key in opts) {
    if (!validKeys.includes(key)) {
      delete opts[key];
    }
  }
  let options = Object.assign(
    {
      allowedOrigins: process.env.CORS_ALLOWED_ORIGINS || "*",
      allowedMethods:
        process.env.CORS_ALLOWED_METHODS || DEFAULT_ALLOWED_METHODS,
      allowedHeaders:
        process.env.CORS_ALLOWED_HEADERS || DEFAULT_ALLOWED_HEADERS,
      maxAge: process.env.CORS_MAX_AGE || "600",
      strict:
        process.env.CORS_STRICT !== undefined ? process.env.CORS_STRICT : true
    },
    opts
  );
  if (
    typeof options.allowedOrigins === "string" &&
    options.allowedOrigins !== "*"
  ) {
    options.allowedOrigins = options.allowedOrigins.split(",");
  }
  if (typeof options.allowedMethods === "string") {
    options.allowedMethods = options.allowedMethods.split(",");
  }
  if (typeof options.allowedHeaders === "string") {
    options.allowedHeaders = options.allowedHeaders.split(",");
  }
  if (typeof options.strict === "string" && options.strict === "true") {
    options.strict = true;
  }
  if (typeof options.strict === "string" && options.strict === "false") {
    options.strict = false;
  }
  return options;
};

export const createOriginHeader = (origin, allowedOrigins) => {
  if (allowedOrigins === "*") {
    return { "Access-Control-Allow-Origin": allowedOrigins };
  }
  let allowedPatterns = allowedOrigins.map(wildcards);
  let isAllowed = allowedPatterns.some(pattern => origin.match(pattern));
  if (isAllowed) {
    return { "Access-Control-Allow-Origin": origin };
  }
  return {};
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
