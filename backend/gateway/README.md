API Gateway Folder 

You create a simple gateway service that routes all requests.

Example:

GET /reports → forwards to report-service

POST /auth/login → forwards to user-service

The frontend/mobile app then only needs to call one base URL.

You can build the gateway with Express + http-proxy-middleware, or later switch to NGINX or Kong if needed.