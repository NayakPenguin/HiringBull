import { client } from '@/api/common/client';
import { UserInfo, type DeviceRegistration, type DeviceResponse, type UserRegistration } from './types';

const BASE_USER_URL = '/api/users/me';


export const registerDevice = async (data: DeviceRegistration) => {
    const res = await client.post<DeviceResponse>('/api/users/devices', data);
    return res.data;
}
  
export const registerUser =  async (payload: Partial<UserRegistration>) => {
    const {data} = await client.put(BASE_USER_URL, payload);
    return data;
}

export const getUserInfo = async ()=>{
    const {data} = await client.get<UserInfo>(BASE_USER_URL);
    return data;
}
