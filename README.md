# AWS Lambda CORS

AWS has made setting up microservice APIs a breeze by attaching [Lambda](https://aws.amazon.com/lambda/) functions to [API Gateways](https://aws.amazon.com/api-gateway/) with [aws-sam-cli](https://aws.amazon.com/serverless/sam/). But when you need more than basic [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) handling you may find yourself writing a lot of duplicate or too-clever-by-half code to handle setting proper headers on your responses. Testing your handlers directly with a testing library like [Jest](https://jestjs.io/) can also become a chore as you may find yourself working around your CORS-handling code. This module attempts to abstrct basic header handling handling to allow you to focus of the business-logic of your serverless functions.

### Basic Usage

```js
const { cors } = require("@spencerbeggs/aws-lambda-cors");

module.export.handler = function() {
  const { event, context, callback, response } = cors(...arguments);
};
```
