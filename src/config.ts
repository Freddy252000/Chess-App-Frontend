import { Platform } from 'react-native';

/**
 * Where the Node.js API lives.
 *  - Android emulator  → the PC is reachable at 10.0.2.2
 *  - iOS simulator     → localhost
 *  - Physical phone    → your PC's LAN IP, e.g. 'http://192.168.1.20:4000' (same Wi-Fi, allow port 4000 in the Windows firewall)
 *  - Production        → your https:// domain
 */
const DEV_URL = Platform.select({ android: 'http://10.0.2.2:4000', default: 'http://localhost:4000' }) as string;
const PROD_URL = 'https://your-api-domain.com';

export const API_ORIGIN = __DEV__ ? DEV_URL : PROD_URL;
export const API_URL = `${API_ORIGIN}/api`;
