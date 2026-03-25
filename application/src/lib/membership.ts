// features/membership/storage.ts

import { storage } from './storage';

const MEMBERSHIP_KEY = 'membership_data';

export type MembershipData = {
  email: string;
  membershipEnd: string;
};

export const saveMembership = (data: MembershipData) => {
  storage.set(MEMBERSHIP_KEY, JSON.stringify(data));
};

export const getMembership = (): MembershipData | null => {
  const value = storage.getString(MEMBERSHIP_KEY);
  return value ? JSON.parse(value) : null;
};

export const clearMembership = () => {
  storage.remove(MEMBERSHIP_KEY);
};

export const isMembershipValid = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  return expiry > today;
};
