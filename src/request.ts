import type { Receiver } from "@upstash/qstash";
import type { Job, JobMap } from "./job";

/**
 * Request handler options.
 */
export interface RequestHandlerOptions {
  request: Request;
  jobs: Job[];
  receiver: Receiver;
}

/**
 * Request handler.
 */
export async function requestHandler({
  request,
  jobs,
  receiver,
}: RequestHandlerOptions) {
  /**
   * Global registry of all jobs.
   */
  const registry: JobMap = new Map();

  /**
   * Register the jobs so they can be executed.
   */
  for (const job of jobs) {
    registry.set(job.key, job.handler);
  }

  /**
   * Parse the request.
   */
  const url = new URL(request.url);
  const key = url.searchParams.get("job");
  const signature = request.headers.get("Upstash-Signature");

  /**
   * Validate the request.
   */
  if (!signature || !key) {
    console.error("Missing signature or key");

    return new Response("Missing signature or key", { status: 400 });
  }

  /**
   * Parse the request body.
   */
  const body = await request.json();

  /**
   * Verify the request.
   */
  const valid = await receiver.verify({
    signature,
    body: JSON.stringify(body),
  });

  if (!valid) {
    console.error("Invalid signature");

    return new Response("Invalid signature", { status: 400 });
  }

  /**
   * Get the handler.
   */
  const handler = registry.get(key);

  if (!handler) {
    console.error("Handler not registered");

    return new Response("Handler not registered", { status: 404 });
  }

  /**
   * Execute the handler.
   */
  await handler(body.payload);

  /**
   * Return a response.
   */
  return new Response();
}
