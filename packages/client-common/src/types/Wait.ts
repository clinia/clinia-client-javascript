import { RequestOptions } from '@clinia/transporter';

export type Wait<TResponse> = (
  /**
   * The original response.
   */
  response: TResponse,

  /**
   * The custom request options.
   */
  requestOptions?: RequestOptions
) => Readonly<Promise<any>>;
