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
// biome-ignore lint/suspicious/noExplicitAny: any for flexibility.
export type JobFunction<T = any> = (payload: T) => Promise<void>;

/**
 * Job map.
 */
export type JobMap = Map<string, JobFunction>;
