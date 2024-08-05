import { Client, type PublishRequest } from "@upstash/qstash";

/**
 * Configuration for the manager.
 */
interface ManagerConfig {
  /**
   * The Upstash QStash token to use.
   *
   * @see https://console.upstash.com/qstash
   */
  token: string;

  /**
   * The API endpoint to use.
   *
   * @example "https://your-domain.com/api/queue"
   */
  endpoint: string;

  /**
   * Whether to retry failed jobs.
   *
   * @default false
   *
   * @see https://upstash.com/docs/qstash/features/retry
   */
  retry?:
    | false
    | {
        /**
         * The number of retries to attempt before giving up.
         *
         * @default 5
         */
        retries?: number;
        /**
         * A backoff function receives the current retry cound and returns a number in milliseconds to wait before retrying.
         *
         * @default
         * ```ts
         * Math.exp(retryCount) * 50
         * ```
         */
        backoff?: (retryCount: number) => number;
      };
}

/**
 * Options for triggering a job.
 */
type TriggerOptions = Omit<PublishRequest, "body">;

/**
 * Options for queueing a job.
 */
type QueueOptions = TriggerOptions & { queue?: string };

/**
 * Create a new queue manager.
 */
export function createManager(config: ManagerConfig) {
  return new JobManager(config);
}

/**
 * A queue manager.
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
   * The queues to use.
   */
  private queues: Map<string, ReturnType<Client["queue"]>> = new Map();

  /**
   * Create a new queue manager.
   *
   * @param config - The configuration to use.
   */
  constructor(config: ManagerConfig) {
    this.client = new Client({
      token: config.token,
      retry: config.retry ?? false,
    });

    this.endpoint = config.endpoint;
  }

  /**
   * Create a new queue.
   *
   * @param name - The name of the queue.
   * @param options - The options to use.
   * @param options.parallelism - The number of jobs to run in parallel.
   */
  public async createQueue(name: string, options: { parallelism: number }) {
    const queue = this.client.queue({ queueName: name });

    await queue.upsert({ parallelism: options.parallelism ?? 1 });

    this.queues.set(name, queue);
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
      trigger: (payload: TPayload, options?: TriggerOptions) =>
        this.trigger(key, payload, options),

      /**
       * Queue a job to run at a later time.
       */
      queue: (payload: TPayload, options: QueueOptions) =>
        this.queue(key, payload, options),
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
    options?: TriggerOptions,
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
  private trigger<TBody>(key: string, body: TBody, options?: TriggerOptions) {
    const job = this.buildRequest(key, body, options);

    return this.client.publishJSON(job);
  }

  /**
   * Queue a job.
   *
   * @param key - The job key.
   * @param body - The job payload.
   * @param options - The options to use.
   */
  private queue<TBody>(key: string, body: TBody, options: QueueOptions) {
    const name = options.queue ?? "default";
    const queue = this.queues.get(name);

    if (!queue) {
      throw new Error(`Queue "${name}" does not exist`);
    }

    const job = this.buildRequest(key, body, options);

    return queue.enqueueJSON(job);
  }
}
