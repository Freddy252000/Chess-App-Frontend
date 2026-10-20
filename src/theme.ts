import { Platform } from 'react-native';

export const C = {
  green: '#1B4332', greenDark: '#0D2818', greenLight: '#2D6A4F', mint: '#52B788',
  cream: '#F0D9B5', brown: '#B58863', bg: '#F4F6F8', white: '#FFFFFF',
  text: '#1A1A2E', text2: '#4A5568', muted: '#8A9BB0', border: '#E2E8F0', input: '#F8F9FA',
  danger: '#EF4444', warn: '#F59E0B', ok: '#22C55E',
};
export const display = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
export const shadow = {
  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 }, elevation: 2,
};
