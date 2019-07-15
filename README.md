# AWS Lambda CORS

AWS has made setting up microservice APIs a breeze by attaching [Lambda](https://aws.amazon.com/lambda/) functions to [API Gateways](https://aws.amazon.com/api-gateway/) with via [Lambda Proxy Integrations in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html). But when you need more than basic [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) handling you may find yourself writing a lot of duplicate or too-clever-by-half code to handle setting proper headers on your responses. Testing your handlers directly with a testing library like [Jest](https://jestjs.io/) can also become a chore as you may find yourself working around your CORS-handling code. This module attempts to abstrct basic header handling handling to allow you to focus of the business-logic of your serverless functions.

### Basic Usage

```js
const { cors } = require("@spencerbeggs/aws-lambda-cors");

module.export.handler = function() {
  const { event, context, callback, data, response } = cors(...arguments);
  response.body = JSON.stringify({
    message: "Hello, world!"
  });
  callback(null, response);
};
```

The `cors` function returns the regular `event`, `context` and `callback` arguments available to a Lamabda functions you would expect to from a proxy integration. If the event passed to your function has a `Content-Type` header starting with to `application/json`, the function attempts to parse the event body with `JSON.parse` and return an object; if the body cannot be parse the data argument with be the raw event body. If the event does not have a body, the data argument will be `null`.

The `response` argument is simply an object with origin headers setup and its `statusCode` propery set to `200`. If you want to send a JSON response, you need to set the body property of the `response` object and send stringified JSON.

Note: You can set `module.exports.handler` to `function()` or `async function()` but you cannot set it to `() =>` or `async () =>` because fat arrow functions [do not have bindings to the arguments keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).
