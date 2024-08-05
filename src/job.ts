/**
 * Job handler.
 */
export interface Job {
  /**
   * The job key, used to identify the job.
   */
  key: string;

  /**
   * The job function, called when the job is triggered.
   */
  handler: JobFunction;
}

/**
 * Job function.
 */
// biome-ignore lint/suspicious/noExplicitAny:
export type JobFunction<T = any> = (payload: T) => Promise<void>;
