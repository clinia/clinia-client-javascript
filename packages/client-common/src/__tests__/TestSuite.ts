import cliniaForBrowser from '../../../clinia/src/builds/browser';
import cliniaForBrowserLite from '../../../clinia/src/builds/browserLite';
import cliniaForNode, { SearchIndex } from '../../../clinia/src/builds/node';

/* eslint functional/no-class: 0 */
export class TestSuite {
  public readonly testName: string;

  public readonly isBrowserLite: boolean = testing.isBrowserLite();

  public readonly isBrowser: boolean = testing.isBrowser();

  // @ts-ignore
  // eslint-disable-next-line no-nested-ternary
  public readonly clinia: typeof cliniaForNode = this.isBrowserLite
    ? cliniaForBrowserLite
    : this.isBrowser
    ? cliniaForBrowser
    : cliniaForNode;

  public indices: SearchIndex[];

  public async cleanUp(): Promise<void> {}

  public constructor(testName?: string) {
    this.ensureEnvironmentVariables();

    this.testName = testName || '';
    this.indices = [];
  }

  public makeSearchClient(
    appIdEnv: string = 'CLINIA_APPLICATION_ID_1',
    apiKeyEnv: string = 'CLINIA_ADMIN_KEY_1'
  ) {
    return this.clinia(`${process.env[appIdEnv]}`, `${process.env[apiKeyEnv]}`);
  }

  public makeIndex(indexName?: string) {
    const index = this.makeSearchClient().initIndex(indexName || this.makeIndexName());

    this.indices.push(index);

    return index;
  }

  public makeIndexName(): string {
    const instanceName = this.makeInstanceName();
    const dateTime = this.makeDateTime();

    return `javascript_${dateTime}_${instanceName}_${this.testName}_${this.indices.length}`;
  }

  public makeDateTime(): string {
    const now = new Date();

    const makeTwoDigitsString = function(n: number): string {
      return `0${n}`.slice(-2);
    };

    const date =
      `${now.getFullYear()}-` +
      `${makeTwoDigitsString(now.getMonth() + 1)}-` +
      `${makeTwoDigitsString(now.getDate())}`;

    const time =
      `${makeTwoDigitsString(now.getHours())}:` +
      `${makeTwoDigitsString(now.getMinutes())}:` +
      `${makeTwoDigitsString(now.getSeconds())}`;

    return `${date}-${time}`;
  }

  public makeInstanceName(): string {
    const environment = testing.environment();
    const nodeVersion = process.versions.node;
    const jobNumber = process.env.CIRCLE_BUILD_NUM;
    const user = process.env.USER;

    if (jobNumber) {
      return `${environment}_${nodeVersion}_${jobNumber}`;
    } else if (user) {
      return `${environment}_${nodeVersion}_${user}`;
    }

    return `${environment}_${nodeVersion}_unknown`;
  }

  private ensureEnvironmentVariables(): void {
    const envs = [
      'CLINIA_APPLICATION_ID_1',
      'CLINIA_APPLICATION_ID_2',
      'CLINIA_ADMIN_KEY_1',
      'CLINIA_ADMIN_KEY_2',
      'CLINIA_APPLICATION_ID_MCM',
      'CLINIA_ADMIN_KEY_MCM',
      'CLINIA_SEARCH_KEY_1',
    ];

    envs.forEach(env => {
      if (process.env[env] === undefined) {
        throw new Error(`Missing '${env}' environment variable.`);
      }
    });
  }
}
