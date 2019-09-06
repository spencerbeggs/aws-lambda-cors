export const DEFAULT_ALLOWED_HEADERS = [
  "Content-Type",
  "X-Amz-Date",
  "Authorization",
  "X-Api-Key",
  "X-Amz-Security-Token"
];

export const DEFAULT_ALLOWED_METHODS = [
  "GET",
  "OPTIONS",
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
];

export const CORS_SAFELISTED_HEADERS = [
  "Accept",
  "Accept-Language",
  "Content-Language",
  "Content-Type",
  "DPR",
  "Downlink",
  "Save-Data",
  "Viewport-Width",
  "Width"
];

export const FORBIDDEN_HEADERS = [
  "Accept-Charset",
  "Accept-Encoding",
  "Access-Control-Request-Headers",
  "Access-Control-Request-Method",
  "Connection",
  "Content-Length",
  "Cookie",
  "Cookie2",
  "Date",
  "DNT",
  "Expect",
  "Host",
  "Keep-Alive",
  "Origin",
  "Referer",
  "TE",
  "Trailer",
  "Transfer-Encoding",
  "Upgrade",
  "Via",
  "User-Agent"
];

export const FORBIDDEN_WILDCARD_HEADERS = ["Proxy-", "Sec-"];

export const CONTENT_TYPE_ALLOWED_VALUES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
];
