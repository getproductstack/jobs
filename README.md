# ProductStack Jobs

Type-safe background jobs and message queue for serverless providers (Vercel, Cloudflare, etc.). Built on top of
[Upstash QStash](https://upstash.com/docs/qstash/).

## Example

1. Configure the client

```ts
import { config } from "@productstack/jobs";

const { createJob } = config({
  endpoint: "https://my-app/api/queue",
  queues: ["default", "other"],
  token: "qstash-token",
});
```

2. Create a job.

```ts
export const myJob = createJob("my-job", async (payload) => {
  console.log(payload);
});
```

3. Register the jobs.

```ts
import { createHandler } from "@productstack/jobs/adapters/nextjs";

// app/api/queue/route.ts
export const { POST } = createHandler({
  jobs: [myJob],
  nextSigningKey: "next-signing-key",
  currentSigningKey: "current-signing-key",
});
```

4. Trigger as a background job or queue it.

```ts
await myJob.trigger({ name: "world" });
await myJob.queue({ name: "world" }, { queue: "other" });
```

## Motivation

Background jobs and queues are notoriously missing from popular serverless environments like Vercel. QStash is a cost-effective messaging solution that can be used to offload background jobs and control concurrency in these environments. This library aims to provide a better developer experience when using QStash by providing a clean and organized way to define jobs that can then be triggered (in the background) or queued using a type-safe API.

## Installation

Run the following command:

```sh
pnpm add @getproductstack/jobs
```
