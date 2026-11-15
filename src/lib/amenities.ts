export const AMENITIES = [
  { value: "PARKING", field: "parking", label: "amenity.parking" },
  { value: "FURNISHED", field: "furnished", label: "amenity.furnished" },
  { value: "ELEVATOR", field: "elevator", label: "amenity.elevator" },
  { value: "BALCONY", field: "balcony", label: "amenity.balcony" },
  { value: "WIFI", field: "wifi", label: "amenity.wifi" },
  {
    value: "BILLS_INCLUDED",
    field: "billsIncluded",
    label: "amenity.billsIncluded",
  },
] as const;
export type Amenity = (typeof AMENITIES)[number]["value"];
export type AmenityFilter = Amenity | "NO_PARKING";
export function parseAmenities(values: string[]): AmenityFilter[] {
  const allowed = new Set<string>([
    ...AMENITIES.map((a) => a.value),
    "NO_PARKING",
  ]);
  const result = [
    ...new Set(values.filter((v) => allowed.has(v))),
  ] as AmenityFilter[];
  return result.includes("PARKING")
    ? result.filter((v) => v !== "NO_PARKING")
    : result;
}
export function readListingAmenities(fd: FormData) {
  return {
    parking: fd.get("parking") === "on",
    furnished: fd.get("furnished") === "on",
    elevator: fd.get("elevator") === "on",
    balcony: fd.get("balcony") === "on",
    wifi: fd.get("wifi") === "on",
    billsIncluded: fd.get("billsIncluded") === "on",
  };
}
export function offeredAmenities(
  listing: Partial<Record<(typeof AMENITIES)[number]["field"], boolean | null>>,
): Amenity[] {
  return AMENITIES.filter((a) => listing[a.field] === true).map((a) => a.value);
}
export function amenityWhere(amenities: AmenityFilter[]) {
  return Object.fromEntries(
    amenities.map((value) =>
      value === "NO_PARKING"
        ? ["parking", false]
        : [AMENITIES.find((a) => a.value === value)!.field, true],
    ),
  );
}
