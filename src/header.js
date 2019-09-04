import { DEFAULT_ALLOWED_HEADERS, DEFAULT_ALLOWED_METHODS } from "./constants";

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

export const createOriginHeader = (
  origin,
  allowedOrigins = process.env.CORS_ALLOWED_ORIGINS || "*"
) => {
  if (!origin) {
    return {};
  }
  if (allowedOrigins === "*") {
    return { "Access-Control-Allow-Origin": allowedOrigins };
  } else if (typeof allowedOrigins === "string") {
    allowedOrigins = allowedOrigins.split(",");
  }
  const allowedPatterns = allowedOrigins.map(wildcards);
  const isAllowed = allowedPatterns.some(pattern => origin.match(pattern));
  if (isAllowed) {
    return { "Access-Control-Allow-Origin": origin };
  }
  return {};
};

export const createOptionsHeader = (origin, opts = {}) => {
  let {
    allowedMethods,
    allowedHeaders,
    allowedOrigins,
    maxAge
  } = Object.assign(
    {
      allowedMethods:
        process.env.CORS_ALLOWED_METHODS || DEFAULT_ALLOWED_METHODS,
      allowedHeaders:
        process.env.CORS_ALLOWED_HEADERS || DEFAULT_ALLOWED_HEADERS,
      maxAge: process.env.CORS_MAX_AGE || "600"
    },
    opts
  );
  if (typeof allowedMethods === "string") {
    allowedMethods = allowedMethods.split(",");
  }

  if (typeof allowedHeaders === "string") {
    allowedHeaders = allowedHeaders.split(",");
  }
  return Object.assign(createOriginHeader(origin, allowedOrigins), {
    "Access-Control-Allow-Headers": allowedHeaders.join(","),
    "Access-Control-Allow-Methods": allowedMethods.join(","),
    "Access-Control-Max-Age": maxAge
  });
};

export const createCORSHeader = (origin, opts = {}) => {
  let { allowedMethods, allowedHeaders, allowedOrigins } = Object.assign(
    {
      allowedMethods:
        process.env.CORS_ALLOWED_METHODS || DEFAULT_ALLOWED_METHODS,
      allowedHeaders:
        process.env.CORS_ALLOWED_HEADERS || DEFAULT_ALLOWED_HEADERS,
      maxAge: process.env.CORS_MAX_AGE || "600"
    },
    opts
  );
  if (typeof allowedMethods === "string") {
    allowedMethods = allowedMethods.split(",");
  }

  if (typeof allowedHeaders === "string") {
    allowedHeaders = allowedHeaders.split(",");
  }
  return Object.assign(createOriginHeader(origin, allowedOrigins), {
    "Access-Control-Allow-Headers": allowedHeaders.join(","),
    "Access-Control-Allow-Methods": allowedMethods.join(",")
  });
};
