# ProductStack Jobs

Simple, type-safe functions that can be triggered as background jobs or queued. Built on top of [Upstash QStash](https://upstash.com/docs/qstash/) for Next.js and Vercel.

## Example

```ts
export const job = createJob("hello", async ({ name }: { name: string }) => {
  console.log(`Hello from the background, ${name}!`);
});

await job.trigger({ name: "world" });
```

## Motivation

Background jobs, events, queues, etc. are notoriously missing from Next.js and Vercel. There are services like [Inngest](https://inngest.com/) and [Trigger.dev](https://trigger.dev/) that provide these async workflows but they are not as simple or as cost-effective as Upstash QStash.

This library aims to improve the developer experience when using QStash by treating jobs as first-class objects that can be triggered and/or queued.

## Get started

Before you get started, make sure you have your [QStash token and signing keys](https://upstash.com/docs/qstash/overall/getstarted#get-your-token).

**Install the package**

```sh
pnpm add @getproductstack/jobs
```
  
**Create a route handler**

```ts
// app/api/jobs/route.ts
import { createHandler } from "@productstack/jobs/nextjs";

export const { POST } = createHandler({
  jobs: [// jobs you define here],
  receiver: new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
  }),
});
```

**Configure the client**

```ts
// lib/jobs.ts
import { createManager } from "@productstack/jobs";

const { createJob } = createManager({
  token: "qstash-token",
  // the URL for theroute you created in step 1
  endpoint: "https://my-app.com/api/jobs",
});
```

**Define and register a job**

```ts
export const myJob = createJob("my-job", async (payload) => {
  console.log(payload);
});

// app/api/queue/route.ts
export const { POST } = createHandler({
  jobs: [myJob],
});
```

**Trigger the job**

```ts
await myJob.trigger({ name: "world" });
```
