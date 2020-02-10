import { Transporter } from '@clinia/transporter';

export type PlacesClient = {
  /**
   * The application id.
   */
  readonly appId: string;

  /**
   * The underlying transporter.
   */
  readonly transporter: Transporter;

  /**
   * Mutates the transporter, adding the given user agent.
   */
  readonly addCliniaAgent: (segment: string, version?: string) => void;

  /**
   * Clears both requests and responses caches.
   */
  readonly clearCache: () => Readonly<Promise<void>>;
};
