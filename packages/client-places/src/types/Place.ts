import { Bounds, GeoPoint } from '.';

export type Place = {
  readonly id: string;
  readonly type: string;
  readonly formattedAddress?: string;
  readonly suite?: string;
  readonly route?: string;
  readonly postalCode?: string;
  readonly neighborhood?: string;
  readonly locality?: string;
  readonly place?: string;
  readonly district?: string;
  readonly region?: string;
  readonly regionCode?: string;
  readonly country: string;
  readonly countryCode: string;
  readonly geometry: {
    readonly bounds?: Bounds;
    readonly location: GeoPoint;
  };
  readonly timeZoneId: string;
  readonly translations: ReadonlyMap<
    string,
    {
      readonly formattedAddress?: string;
      readonly route?: string;
      readonly neighborhood?: string;
      readonly locality?: string;
      readonly place?: string;
      readonly district?: string;
      readonly region?: string;
      readonly country: string;
    }
  >;
};
