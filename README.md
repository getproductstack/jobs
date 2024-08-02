# ProductStack Jobs

Type-safe background jobs and message queue for serverless providers (Vercel, Cloudflare, etc.). Built on top of
[Upstash QStash](https://upstash.com/docs/qstash/).

## Example

Once installed and configured, background and queued jobs become as simple as normal functions.

```ts
// define a job like a normal function
export const myJob = createJob("my-job", async (payload) => {
  // this code will run in the background
  console.log(payload);
});

// trigger (as a background job)
await myJob.trigger({ name: "world" });

// push it to a queue to be processed in order.
await myJob.queue({ name: "world" }, { queue: "other" });
```

## Motivation

Background jobs and queues are notoriously missing from popular serverless environments like Vercel. QStash is a cost-effective messaging solution that can be used to offload background jobs and control concurrency in these environments. This library aims to provide a better developer experience when using QStash by providing a clean and organized way to define jobs that can then be triggered (in the background) or queued using a type-safe API.

## Get started

Install the package:

```sh
pnpm add @getproductstack/jobs
```

1. Define the route to process the jobs.

```ts
// app/api/queue/route.ts
import { createRouteHandler } from "@productstack/jobs/nextjs";

export const { POST } = createRouteHandler({
  jobs: [
    // register jobs you define here
  ],
  nextSigningKey: "qstash-next-key",
  currentSigningKey: "qstash-current-key",
});
```

2. Configure the client

```ts
import { config } from "@productstack/jobs";

const { createJob } = config({
  token: "qstash-token",
  // the endpoint of the route you created in step 1
  endpoint: "https://my-app.com/api/queue",
  // optional: the queues you want to send jobs to
  queues: ["default", "other"],
});
```

3. Define a job anywhere in your codebase.

```ts
export const myJob = createJob("my-job", async (payload) => {
  console.log(payload);
});
```

4. Register the job.

```ts
// app/api/queue/route.ts
export const { POST } = createHandler({
  jobs: [myJob],
});
```

5. Import your job and trigger (as a background job) or queue it.

```ts
await myJob.trigger({ name: "world" });
await myJob.queue({ name: "world" }, { queue: "other" });
```
