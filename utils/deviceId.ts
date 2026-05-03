import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = 'choosr_device_id';

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(STORAGE_KEY, id);
  return id;
}
