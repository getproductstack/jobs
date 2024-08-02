# ProductStack Jobs

Type-safe background jobs and message queue for serverless providers (Vercel, Cloudflare, etc.). Built on top of
[Upstash QStash](https://upstash.com/docs/qstash/).

## Example

Configure the client.

```ts
import { config } from "@productstack/jobs";

const { createJob } = config({
  endpoint: "https://my-app/api/queue",
  queues: ["default", "other"],
  token: "qstash-token",
});
```

Create a job.

```ts
const job = createJob("my-job", async (payload) => {
  console.log(payload);
});
```

Trigger as a background job or queue it.

```ts
await job.trigger({ name: "world" });
await job.queue({ name: "world" }, { queue: "other" });
```

## Motivation

Background jobs and queues are notoriously missing from popular serverless environments like Vercel. QStash is a cost-effective messaging solution that can be used to offload background jobs and control concurrency in these environments. This library aims to provide a better developer experience when using QStash by providing a clean and organized way to define jobs that can then be triggered (in the background) or queued using a type-safe API.

Vercel

most libraries are not type-safe and
require you to use a specific library for each provider. This library aims to provide a type-safe and flexible solution for
background jobs and queues for serverless applications.

## Installation

Run the following command:

```sh
pnpm add @getproductstack/jobs
```
