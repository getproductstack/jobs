import { Client, PublishRequest } from "@upstash/qstash";

/**
 * Configuration for the manager.
 */
interface Config {
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
   * An array of queue names.
   *
   * @default ["default"]
   */
  queues?: readonly string[];

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
 * Job function.
 */
export type JobFunction<T = any> = (payload: T) => Promise<void>;

/**
 * Job handler.
 */
export interface JobHandler {
  key: string;
  handler: JobFunction;
}

/**
 * Options for triggering a job.
 */
type TriggerOptions = Omit<PublishRequest, "body" | "headers">;

/**
 * Options for queueing a job.
 */
type QueueOptions<T> = TriggerOptions & { queue?: T };

/**
 * The QStash SDK does not export Queue.
 */
type Queue = ReturnType<Client["queue"]>;

/**
 * Create a new queue manager.
 */
export function config<T extends readonly string[]>(
  config: Config & { queues: T }
) {
  return new QueueManager(config);
}

/**
 * A queue manager.
 */
class QueueManager<T extends readonly string[]> {
  /**
   * The Upstash QStash client.
   */
  private client: Client;

  /**
   * The API endpoint to use.
   */
  private endpoint: string;

  /**
   * The queues to use.
   */
  private queues: Record<string, Queue> = {};

  /**
   * Create a new queue manager.
   */
  constructor(config: Config & { queues: T }) {
    this.client = new Client({
      token: config.token,
      retry: config.retry ?? false,
    });

    this.endpoint = config.endpoint;

    for (const queueName of [...config.queues]) {
      this.queues[queueName] = this.client.queue({ queueName });
    }
  }

  /**
   * Create a job.
   */
  createJob<TPayload>(
    key: string,
    handler: (payload: TPayload) => Promise<void>
  ) {
    return {
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
      queue: (payload: TPayload, options: QueueOptions<T[number]>) =>
        this.queue(key, payload, options),
    };
  }

  /**
   * Build a request for triggering/queueing a job.
   */
  private buildRequest<B>(
    key: string,
    body: B,
    options?: TriggerOptions
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
   */
  private trigger<B>(key: string, body: B, options?: TriggerOptions) {
    const job = this.buildRequest(key, body, options);

    return this.client.publish(job);
  }

  /**
   * Queue a job.
   */
  private queue<B>(key: string, body: B, options: QueueOptions<T[number]>) {
    const queueName = options.queue ?? "default";
    const queue = this.queues[queueName];

    if (!queue) {
      throw new Error(`Queue "${queueName}" does not exist`);
    }

    const job = this.buildRequest(key, body, options);

    return queue.enqueueJSON(job);
  }
}
