import { ClientTransporterOptions } from '@clinia/client-common';
import { PlacesClientOptions } from '@clinia/client-places/src';
import { SearchClientOptions } from '@clinia/client-search';

export type WithoutCredentials<TClient> = Omit<TClient, 'appId' | 'apiKey'>;

export type CliniaSearchOptions = Partial<ClientTransporterOptions> &
  WithoutCredentials<SearchClientOptions>;

export type InitPlacesOptions = Partial<ClientTransporterOptions> &
  WithoutCredentials<PlacesClientOptions>;
