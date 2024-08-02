import { Receiver } from "@upstash/qstash";
import type { JobFunction, JobHandler } from "..";

/**
 * Create a new request handler.
 */
export function createHandler({
  jobs,
  nextSigningKey,
  currentSigningKey,
}: {
  jobs: JobHandler[];
  nextSigningKey: string;
  currentSigningKey: string;
}) {
  const receiver = new Receiver({
    currentSigningKey,
    nextSigningKey,
  });
  /**
   * Global registry of all jobs.
   */
  const registry = new Map<string, JobFunction>();

  /**
   * Register the jobs so they can be executed.
   */
  for (const job of jobs) registry.set(job.key, job.handler);

  /**
   * Return the request handler.
   */
  return {
    /**
     * Handle incoming POST requests.
     */
    POST: async (request: Request) => {
      const url = new URL(request.url);
      const key = url.searchParams.get("job");
      const signature = request.headers.get("Upstash-Signature");

      if (!signature || !key) {
        console.error("Missing signature or key");

        return new Response("Missing signature or key", { status: 400 });
      }

      const body = await request.json();

      const valid = await receiver.verify({
        signature,
        body: JSON.stringify(body),
      });

      if (!valid) {
        console.error("Invalid signature");

        return new Response("Invalid signature", { status: 400 });
      }

      const handler = registry.get(key);

      if (!handler) {
        console.error("Handler not registered");

        return new Response("Handler not registered", { status: 404 });
      }

      await handler(body.payload);

      return new Response();
    },
  };
}
