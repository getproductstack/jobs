# ProductStack Jobs

Simple, type-safe functions that can be triggered as background jobs or queued. Built on top of
[Upstash QStash](https://upstash.com/docs/qstash/) for Next.js and Vercel.

## Example

```ts
export const helloJob = createJob("hello", async ({ name }: { name: string }) => {
  // this code will run in the background
  console.log(`Hello from the background, ${name}!`);
});

await helloJob.trigger({ name: "world" });
```

## Motivation

With Next.js and Vercel, background jobs, events, queues, etc. are notoriously missing. There are services like [Inngest](https://inngest.com/) and [Trigger.dev](https://trigger.dev/) that provide these async workflows but they are not as simple or as cost-effective as Upstash QStash.

The only problem with QStash is that the DX leaves a few things to be desired. This library aims to bridge that gap by treating jobs as first-class citizens in your codebase that can be triggered and/or queued.

## Get started

Install the package:

```sh
pnpm add @getproductstack/jobs
```

1. Define the route to process the jobs.

```ts
// app/api/queue/route.ts
import { createRouteHandler } from "@productstack/jobs/nextjs";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

export const { POST } = createRouteHandler({
  jobs: [
    // register jobs you define here
  ],
  receiver,
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
