// import {config} from @getproductstack/jobs

import { config } from ".";

const messaging = config({
  token: process.env.QSTASH_TOKEN!,
  queues: ["default", "activity"] as const,
});

messaging.queueJob("default");
