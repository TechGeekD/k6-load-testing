import { Trend } from "k6/metrics";

import "./libs/shim/core.js";
import "./libs/shim/expect.js";
import "./libs/shim/urijs.js";
import "./libs/spo-gpo.js";
import "./libs/shim/core.js";
import URI from "./libs/urijs.js";
import aws4 from "./libs/aws4.js";

import { esQuery as queryJSON } from "./json.js"
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, ES_DOMAIN, projectID, headers } from "./constants.js";

export let options = { maxRedirects: 4, iterations: "1", vus: 1,
  ext: {
    loadimpact: {
      projectID: projectID,
      name: 'TopSoundRecord'
    }
  }
};

const overAllReqTime = new Trend("overall_req_time");

const Request = Symbol.for("request");
postman[Symbol.for("initial")]({
  options,
  collection: {
    baseURL: ES_DOMAIN
  }
});

const payload = JSON.stringify(queryJSON);

export default function() {
  /** @desc ElasticSearch Endpoint: hit ES RestAPI endpoint */
  postman[Request]({
    name: "ES-Ultrawarm",
    id: "75b1c359-3bed-4369-9819-f84b39e8e90c",
    method: "GET",
    address: "{{baseURL}}/_search?size=0",
    data: payload,
    headers: headers,
    auth(config, Var) {
      const address = new URI(config.address);
      const options = {
        method: "GET",
        protocol: address.protocol(),
        hostname: address.hostname(),
        port: address.port(),
        headers: {
            'Content-Type': headers["Content-Type"]
        },
        path: address.path() + address.search(),
        service: "es",
        body: config.data
      };
      const credential = {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      };
      const signed = aws4.sign(options, credential);
      const [path, query = ""] = signed.path.split("?");
      config.address = new URI()
        .protocol(address.protocol())
        .hostname(signed.hostname)
        .path(path)
        .query(query)
        .toString();
      Object.assign(config.headers, signed.headers);
    },
    post(response) {

        console.log(JSON.stringify(response, null, 2))

        overAllReqTime.add(response.timings.blocked);
        overAllReqTime.add(response.timings.looking_up);
        overAllReqTime.add(response.timings.connecting);
        overAllReqTime.add(response.timings.sending);
        overAllReqTime.add(response.timings.waiting);
        overAllReqTime.add(response.timings.receiving);
        overAllReqTime.add(response.timings.duration);

        pm.test("Status code is 200", function () {
            pm.response.to.have.status(200);
        });
    }
  });
}
