# ProductStack Jobs

Type-safe background jobs, messaging and scheduling for serverless (Vercel, Netlify, Cloudflare, etc.). Built on top of
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

## Installation

Run the following command:

```sh
pnpm add @getproductstack/jobs
```
