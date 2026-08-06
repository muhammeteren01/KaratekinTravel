import {
  BootstrapSchema,
  type BootstrapPayload,
  type Trip,
  type Company,
  type Reservation,
  type Review,
  type User,
  type SupportingData,
} from "../schemas";
import { migrateBootstrap } from "../migrations";

export async function fetchBootstrapLocal(): Promise<BootstrapPayload> {
  const raw: any = require("../examples/bootstrap.sample.json");
  const migrated = migrateBootstrap(raw);
  return BootstrapSchema.parse(migrated);
}

export async function fetchTripsLocal(): Promise<Trip[]> {
  const b = await fetchBootstrapLocal();
  return b.trips;
}

export async function fetchCompaniesLocal(): Promise<Company[]> {
  const b = await fetchBootstrapLocal();
  return b.companies;
}

export async function fetchReservationsLocal(): Promise<Reservation[]> {
  const b = await fetchBootstrapLocal();
  return b.reservations ?? [];
}

export async function fetchReviewsLocal(): Promise<Review[]> {
  const b = await fetchBootstrapLocal();
  return b.reviews ?? [];
}

export async function fetchUsersLocal(): Promise<User[]> {
  const b = await fetchBootstrapLocal();
  return b.users ?? [];
}

export async function fetchSupportingDataLocal(): Promise<
  SupportingData | undefined
> {
  const b = await fetchBootstrapLocal();
  return b.supportingData;
}
