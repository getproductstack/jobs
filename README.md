# ProductStack Jobs

Type-safe background jobs, messaging and scheduling.

## Example

```ts
import { config } from "@productstack/jobs";

const { createJob } = config({
  endpoint: "https://my-app/api/queue",
  queues: ["default", "other"],
  token: "qstash-token",
});
```

```ts
const job = createJob("my-job", async (payload) => {
  console.log(payload);
});
```

```ts
await job.trigger({ name: "world" });
await job.queue({ name: "world" }, { queue: "other" });
```

## Installation

Run the following command:

```sh
pnpm add @productstack/jobs
```
