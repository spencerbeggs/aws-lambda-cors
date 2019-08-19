import { DEFAULT_ALLOWED_HEADERS, DEFAULT_ALLOWED_METHODS } from "./constants";
import { createCORSHeader, createOriginHeader } from "./header";

import process from "process";

export const cors = (event, context, callback, opts = {}) => {
  let options = Object.assign(
    {
      allowedOrigins: process.env.CORS_ALLOWED_ORIGINS || "*",
      allowedMethods:
        process.env.CORS_ALLOWED_METHODS || DEFAULT_ALLOWED_METHODS,
      allowedHeaders:
        process.env.CORS_ALLOWED_HEADERS || DEFAULT_ALLOWED_HEADERS,
      maxAge: process.env.CORS_MAX_AGE || "600",
      strict: true
    },
    opts
  );
  let lowerCaseHeaders = Object.keys(event.headers).reduce((acc, header) => {
    acc[header.toLowerCase()] = event.headers[header];
    return acc;
  }, {});
  let origin = lowerCaseHeaders.origin;
  if (event.httpMethod.toLowerCase() === "options") {
    return callback(null, {
      statusCode: 204,
      headers: createCORSHeader(origin, options)
    });
  } else {
    let res = {
      response: {
        statusCode: 200,
        headers: createOriginHeader(origin, options.allowedOrigins)
      },
      data: event.body || null,
      context,
      callback,
      event
    };
    if (
      !res.response.headers["Access-Control-Allow-Origin"] &&
      options.strict
    ) {
      res.response.statusCode = 401;
      return callback(null, res.response);
    }
    if (
      lowerCaseHeaders["content-type"] &&
      lowerCaseHeaders["content-type"].startsWith("application/json")
    ) {
      try {
        res.data = JSON.parse(res.data);
      } catch (err) {
        console.log("Error parsing event.body");
      }
    }
    return res;
  }
};
