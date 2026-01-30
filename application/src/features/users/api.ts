import { client } from '@/api/common/client';

import {
  type DeviceRegistration,
  type DeviceResponse,
  type UserInfo,
  type UserRegistration,
} from './types';

const BASE_USER_URL = '/api/users/me';
const BASE_WEB_REGISTRATION_URL = '/api/web-registration';

export const registerDevice = async (data: DeviceRegistration) => {
  const res = await client.post<DeviceResponse>('/api/users/devices', data);
  return res.data;
};

export const registerUser = async (payload: Partial<UserRegistration>) => {
  const { data } = await client.put(BASE_USER_URL, payload);
  return data;
};

export const getUserInfo = async () => {
  const { data } = await client.get<UserInfo>(BASE_USER_URL);
  return data;
};

export const checkUserVerification = async (email: string) => {
  const { data } = await client.get<{ registered: boolean }>(
    `${BASE_WEB_REGISTRATION_URL}/check?email=${email}`
  );
  return data;
};

export const resetUser = async () => {
  const res = await client.delete<DeviceResponse>(`/api/users/devices/me`);

  return res.data;
};
export const updatePushToken = async (payload: Partial<DeviceRegistration>) => {
  const { data } = await client.put('/api/users/devices', payload);
  return data;
};