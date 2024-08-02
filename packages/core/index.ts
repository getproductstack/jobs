import type { PublishRequest } from "@upstash/qstash";

/**
 * A function to be run as a job.
 */
type JobFunction = (...args: any[]) => Promise<void>;

/**
 * A job to be run.
 */
type Job = {
  /**
   * The key of the job.
   */
  key: string;

  /**
   * The handler function of the job.
   */
  handler: JobFunction;
};

type TriggerOptions = Omit<PublishRequest, "body" | "headers"> & {
  /**
   * Whether to run the job synchronously.
   *
   * @default false
   */
  sync?: boolean;
};

/**
 * Global registry of all jobs.
 */
export const registry = new Map<string, JobFunction>();

/**
 * Register a job handler.
 */
export function registerJob(job: Job) {
  registry.set(job.key, job.handler);
}
