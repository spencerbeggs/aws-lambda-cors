# AWS Lambda CORS

[![Build Status](https://travis-ci.com/spencerbeggs/aws-lambda-cors.svg?branch=master)](https://travis-ci.com/spencerbeggs/aws-lambda-cors) [![Coverage Status](https://coveralls.io/repos/github/spencerbeggs/aws-lambda-cors/badge.svg?branch=master)](https://coveralls.io/github/spencerbeggs/aws-lambda-cors?branch=master) [![Known Vulnerabilities](https://snyk.io/test/githubspencerbeggs/aws-lambda-cors/badge.svg)](https://snyk.io/test/github/spencerbeggs/aws-lambda-cors)

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

The `cors` function will automatically respond with a 204 repsonse when it encounters a `OPTIONS` request with the `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods` and`Access-Control-Max-Age`. For other types of requests the function returns the regular `event`, `context` and `callback` arguments available to a Lamabda functions you would expect to from a proxy integration.

The `response` argument is simply an object with origin headers setup and its `statusCode` propery set to `200`. If you want to send a JSON response, you need to set the body property of the `response` object and send stringified JSON.

If the event passed to your function has a `Content-Type` header starting with to `application/json`, the function attempts to parse the event body with `JSON.parse` and return the resulting JSON as the `data` return value. If the body cannot be parsed into JSON, the funtion will automatically callback with a 400 response.

Note: You can set `module.exports.handler` to `function()` or `async function()` but you cannot set it to `() =>` or `async () =>` because fat arrow functions [do not have bindings to the arguments keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).

### Advanced Usage

The `cors` function takes a second `options` argument that is an object, with the following optional properties: `allowedOrigins`, `allowedMethods`, `allowedHeaders` and `maxAge`. The `allowedOrigins`, `allowedMethods` and `allowedHeaders` properties can be passed as either arrays of strings or as a comma-seperated string. `maxAge` is just a string. You can also pass these options from `process.env` with the respective vaiable names: `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_METHODS`, `CORS_ALLOWED_HEADERS` and `CORS_MAX_AGE`.

```js
const { cors } = require("@spencerbeggs/aws-lambda-cors");

module.export.handler = function() {
  const options = {
    allowedOrigins: ["https://mysite.com", "https://anothersite.com"]
    allowedMethods: ["POST", "PATCH"],
    allowedHeaders: "X-Custom-Header",
    maxAge: "800"
  };
  const { event, context, callback, data, response } = cors(...arguments, options);
  response.body = JSON.stringify({
    message: "Hello, world!"
  });
  callback(null, response);
};
```

The default options object looks like:

```js
const options = {
  allowedOrigins: "*",
  allowedMethods: ["GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "X-Amz-Date",
    "Authorization",
    "X-Api-Key",
    "X-Amz-Security-Token"
  ],
  maxAge: "600"
};
```

You can also set the options by passing values to `process.env`: `process.env.CORS_ALLOWED_ORIGINS`, `process.env.CORS_ALLOWED_METHODS`, `process.env.CORS_ALLOWED_HEADERS` and `process.env.CORS_MAX_AGE`.

### Example CloudFormation Template

Below is a simple CloudFormation template that uses [AWS:Serverless Transform](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-aws-serverless.html) that attaches API Gateway to a serverless function handler for your API endpoint. Note that both the `POST` and `OPTIONS` events point to the same code bundle as this module provides the CORS handling for both.

```yml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Resources:
  Role:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - "lambda.amazonaws.com"
            Action:
              - "sts:AssumeRole"
      ManagedPolicyArns:
        - "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        - "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
  MyFunction:
    Type: "AWS::Serverless::Function"
    Properties:
      CodeUri: s3://my-lambda-functions-bucket/myfunction.zip
      Handler: index.handler
      Runtime: nodejs10.x
      Role: !GetAtt Role.Arn
      Timeout: 3
      Environment:
        Variables:
          CORS_ALLOWED_ORIGINS: "https://siteone.com,https://sitetwo.com"
          CORS_ALLOWED_METHODS: "POST"
      Events:
        post:
          Type: Api
          Properties:
            Path: /my-endpoint
            Method: POST
        options:
          Type: Api
          Properties:
            Path: /my-endpoint
            Method: OPTIONS
```
