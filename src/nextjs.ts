import { type RequestHandlerOptions, requestHandler } from "./request";

/**
 * Create a new request handler for Next.js.
 */
export function createHandler({
  jobs,
  receiver,
}: Omit<RequestHandlerOptions, "request">) {
  return {
    POST: async (request: Request) =>
      requestHandler({
        request,
        jobs,
        receiver,
      }),
  };
}
