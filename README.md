# ProductStack Jobs

Simple, type-safe functions that can be triggered as background jobs or queued. Built on top of
[Upstash QStash](https://upstash.com/docs/qstash/) for Next.js and Vercel.

## Example

```ts
export const helloJob = createJob("hello", async ({ name }: { name: string }) => {
  console.log(`Hello from the background, ${name}!`);
});

await helloJob.trigger({ name: "world" });
```

## Motivation

Background jobs, events, queues, etc. are notoriously missing from Next.js and Vercel. There are services like [Inngest](https://inngest.com/) and [Trigger.dev](https://trigger.dev/) that provide these async workflows but they are not as simple or as cost-effective as Upstash QStash.

This library aims to improve the developer experience when using QStash by treating jobs as first-class objects that can be triggered and/or queued.

## Get started

Install the package:

```sh
pnpm add @getproductstack/jobs
```

1. Create a route handler.

```ts
// app/api/jobs/route.ts
import { createHandler } from "@productstack/jobs/nextjs";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

export const { POST } = createHandler({
  jobs: [
    // register jobs you define here
  ],
  receiver,
});
```

2. Configure the client

```ts
// lib/jobs.ts
import { config } from "@productstack/jobs";

const { createJob } = config({
  token: "qstash-token",
  // the route you created in step 1
  endpoint: "https://my-app.com/api/jobs",
});
```

3. Define jobs anywhere in your codebase.

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

5. Import your job anywhere and trigger it as a background job.

```ts
await myJob.trigger({ name: "world" });
```
