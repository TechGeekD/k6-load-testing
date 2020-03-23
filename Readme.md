# K6 Load testing

Export your postman collection & create k6 script using below commands.

Install K6 load testing tool follow this https://k6.io/docs/getting-started/installation

If not installed postman-to-k6 install:
```shell
npm install -g postman-to-k6
```

Run postman-to-k6:
```shell
postman-to-k6 COLLECTION_NAME.postman_collection.json -o k6-script.js
```

Run k6 script:
```shell
k6 run k6-script.js
```
