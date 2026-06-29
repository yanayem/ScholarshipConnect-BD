import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';

export const apiService = {
  async login(username, password) {
    const response = await fetch(`${API_URL}/accounts/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      await AsyncStorage.setItem('token', data.access);
      await AsyncStorage.setItem('refresh', data.refresh);
    }
    return { ok: response.ok, data };
  },

  async getProfile() {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_URL}/accounts/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refresh');
  }
};
