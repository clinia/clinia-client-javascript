import { Auth, AuthMode, AuthModeType } from '.';

export function createAuth(authMode: AuthModeType, appId: string, apiKey: string): Auth {
  const credentials = {
    'x-clinia-api-key': apiKey,
    'x-clinia-application-id': appId,
  };

  return {
    headers(): Readonly<Record<string, string>> {
      return authMode === AuthMode.WithinHeaders ? credentials : {};
    },

    queryParameters(): Readonly<Record<string, string>> {
      return authMode === AuthMode.WithinQueryParameters ? credentials : {};
    },
  };
}
