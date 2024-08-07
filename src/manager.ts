import type { Client, PublishRequest } from "@upstash/qstash";

/**
 * Configuration for the manager.
 */
interface ManagerConfig {
  /**
   * The Upstash QStash client to use.
   *
   * @see https://upstash.com/docs/qstash/overall/getstarted
   *
   * @example
   * ```ts
   * import { Client } from "@upstash/qstash";
   * const client = new Client({ token: "********" });
   * ```
   */
  client: Client;

  /**
   * The API endpoint to use.
   *
   * @example "https://your-domain.com/api/queue"
   */
  endpoint: string;
}

/**
 * Options for dispatching a job.
 */
type DispatchOptions = Omit<PublishRequest, "body">;

/**
 * Create a new job manager.
 */
export function createManager(config: ManagerConfig) {
  return new JobManager(config);
}

/**
 * A job manager.
 */
class JobManager {
  /**
   * The QStash client.
   */
  private client: Client;

  /**
   * The API endpoint to use.
   */
  private endpoint: string;

  /**
   * Create a new queue manager.
   *
   * @param config - The configuration to use.
   */
  constructor(config: ManagerConfig) {
    this.client = config.client;
    this.endpoint = config.endpoint;
  }

  /**
   * Create a job.
   *
   * @param key - The job key, used to identify the job.
   * @param handler - The job function, called when the job is triggered.
   */
  public createJob<TPayload>(
    key: string,
    handler: (payload: TPayload) => Promise<void>,
  ) {
    return {
      key,
      handler,
      /**
       * Run a job immediately.
       */
      run: (payload: TPayload) => handler(payload),

      /**
       * Run a job in the background.
       */
      dispatch: (payload: TPayload, options?: DispatchOptions) =>
        this.dispatch(key, payload, options),
    };
  }

  /**
   * Build a request for triggering/queueing a job.
   *
   * @param key - The job key.
   * @param body - The job payload.
   * @param options - The options to use.
   *
   * @returns The request that will be sent to QStash.
   */
  private buildRequest<TBody>(
    key: string,
    body: TBody,
    options?: DispatchOptions,
  ): PublishRequest {
    return {
      ...options,
      body,
      method: "POST",
      url: `${this.endpoint}?job=${key}`,
    } as PublishRequest;
  }

  /**
   * Trigger a job.
   *
   * @param key - The job key.
   * @param body - The job payload.
   * @param options - The options to use.
   */
  private dispatch<TBody>(key: string, body: TBody, options?: DispatchOptions) {
    const job = this.buildRequest(key, body, options);

    return this.client.publishJSON(job);
  }
}
