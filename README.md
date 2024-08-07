# ProductStack Jobs

Simple, reliable, type-safe functions that can be dispatched as background jobs. Built on top of [Upstash QStash](https://upstash.com/docs/qstash/).

## Example

```ts
export const job = createJob("hello", async ({ name }: { name: string }) => {
  console.log(`Hello from the background, ${name}!`);
});

await job.dispatch({ name: "world" });
```

## Motivation

This library aims to improve the developer experience when using QStash by treating jobs as first-class objects that can be dispatched.

## Get started

Before you get started, make sure you have your [QStash token and signing keys](https://upstash.com/docs/qstash/overall/getstarted#get-your-token).

**Install the package**

```sh
pnpm add @getproductstack/jobs
```
  
**Create a route handler**

```ts
// app/api/jobs/route.ts
import { Receiver } from "@upstash/qstash";
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
import { Client } from "@upstash/qstash";
import { createManager } from "@productstack/jobs";

const { createJob } = createManager({
  client: new Client({ token: process.env.QSTASH_TOKEN }),
  // the URL for the route.ts you created in step 1
  endpoint: "https://my-app.com/api/jobs",
});
```

**Define and register a job**

```ts
export const myJob = createJob("my-job", async (payload: { name: string }) => {
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
