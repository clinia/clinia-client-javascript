import { ClientTransporterOptions } from '@clinia/client-common';
import { SearchClientOptions } from '@clinia/client-search';

export type WithoutCredentials<TClient> = Omit<TClient, 'appId' | 'apiKey'>;

export type CliniaSearchOptions = Partial<ClientTransporterOptions> &
  WithoutCredentials<SearchClientOptions>;
