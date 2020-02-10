import {
  addMethods,
  AuthMode,
  ClientTransporterOptions,
  createAuth,
  CreateClient,
  shuffle,
} from '@clinia/client-common';
import { CallEnum, createTransporter, HostOptions } from '@clinia/transporter';

import { SearchClient, SearchClientOptions } from './types';

export const createSearchClient: CreateClient<
  SearchClient,
  SearchClientOptions & ClientTransporterOptions
> = options => {
  const appId = options.appId;

  const auth = createAuth(
    options.authMode !== undefined ? options.authMode : AuthMode.WithinHeaders,
    appId,
    options.apiKey
  );

  const transporter = createTransporter({
    hosts: ([
      { url: `api.partner.clinia.ca`, accept: CallEnum.Read },
      { url: `api.partner.clinia.ca`, accept: CallEnum.Write },
    ] as readonly HostOptions[]).concat(
      shuffle([
        { url: `api.partner.clinia.ca` },
        { url: `api.partner.clinia.ca` },
        { url: `api.partner.clinia.ca` },
      ])
    ),
    ...options,
    headers: {
      ...auth.headers(),
      ...{ 'content-type': 'application/x-www-form-urlencoded' },
      ...options.headers,
    },

    queryParameters: {
      ...auth.queryParameters(),
      ...options.queryParameters,
    },
  });

  const base = {
    transporter,
    appId,
    addCliniaAgent(segment: string, version?: string): void {
      transporter.userAgent.add({ segment, version });
    },
    clearCache(): Readonly<Promise<void>> {
      return Promise.all([
        transporter.requestsCache.clear(),
        transporter.responsesCache.clear(),
      ]).then(() => undefined);
    },
  };

  return addMethods(base, options.methods);
};
