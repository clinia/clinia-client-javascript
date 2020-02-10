import { Transporter } from '@clinia/transporter';

export type SearchIndex = {
  /**
   * The application id.
   */
  readonly appId: string;

  /**
   * The index name.
   */
  readonly indexName: string;

  /**
   * The underlying transporter.
   */
  readonly transporter: Transporter;
};
