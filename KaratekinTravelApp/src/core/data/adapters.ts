import type { Trip as SchemaTrip } from './schemas';
import { TripUISchema, type TripUI } from './uiSchemas';

export function mapTripSchemaToUi(t: SchemaTrip): TripUI {
  // Validate and transform to TripUI in one step
  return TripUISchema.parse(t);
}

export function mapTripsSchemaToUi(list: SchemaTrip[] = []): TripUI[] {
  return list.map(mapTripSchemaToUi);
}
