import { AuthModeType } from '@clinia/client-common';

export type SearchClientOptions = {
  /**
   * The engine id.
   */
  readonly engineId: string;

  /**
   * The api key.
   */
  readonly apiKey: string;

  /**
   * The auth mode type. In browser environments credentials may
   * be passed within the headers.
   */
  readonly authMode?: AuthModeType;
};
