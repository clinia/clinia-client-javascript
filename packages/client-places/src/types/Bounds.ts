import { GeoPoint } from '.';

export type Bounds = {
  readonly northEast: GeoPoint;
  readonly southWest: GeoPoint;
};
