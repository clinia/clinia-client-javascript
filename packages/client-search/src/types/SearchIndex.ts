import { Transporter } from '@clinia/transporter';

export type SearchIndex = {
  /**
   * The engine id.
   */
  readonly engineId: string;

  /**
   * The index name.
   */
  readonly indexName: string;

  /**
   * The underlying transporter.
   */
  readonly transporter: Transporter;
};
