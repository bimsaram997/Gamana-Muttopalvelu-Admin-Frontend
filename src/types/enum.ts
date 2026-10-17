export const AddressType = {
  Pickup: 1,
  Dropoff: 2,
} as const;

export type AddressType = (typeof AddressType)[keyof typeof AddressType]; // 1 | 2