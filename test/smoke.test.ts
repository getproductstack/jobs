import { expect, mock, test } from "bun:test";
import { createManager } from "../src";

mock.module("@upstash/qstash", () => ({
  Client: class MockClient {
    publishJSON = mock(() => Promise.resolve());
    receiver() {
      return {
        verify: mock(() => Promise.resolve(true)),
      };
    }
  },
}));

test("creates a JobManager instance", () => {
  const manager = createManager({
    token: "test-token",
    endpoint: "https://test-endpoint.com",
  });

  expect(manager).toBeDefined();
  expect(typeof manager.createJob).toBe("function");
  expect(typeof manager.createQueue).toBe("function");
});

test("creates a job with run, trigger, and queue methods", async () => {
  const manager = createManager({
    token: "test-token",
    endpoint: "https://test-endpoint.com",
  });

  const job = manager.createJob(
    "test-job",
    async (payload: { message: string }) => {
      `Processed: ${payload.message}`;
    },
  );

  expect(typeof job.run).toBe("function");
  expect(typeof job.dispatch).toBe("function");
  expect(typeof job.queue).toBe("function");
});
