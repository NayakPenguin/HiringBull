import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';

const getOrCreateDeviceId = async () => {
  let deviceId = await SecureStore.getItemAsync('DEVICE_ID');

  if (!deviceId) {
    deviceId =
      Application.getAndroidId() ??
      (await Application.getIosIdForVendorAsync());

    await SecureStore.setItemAsync('DEVICE_ID', String(deviceId));
  }

  return deviceId;
};
export default getOrCreateDeviceId;
