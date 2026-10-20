# Chess Academy – React Native app (CLI, no Expo)

Talks to the Node.js server in `../server`. All network code is in `src/api/index.ts`.

## 1. Add to your React Native CLI project
Copy `src/` into your project and replace `App.tsx` (keep your `android/`, `ios/`, `index.js`).

```bash
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
      react-native-screens react-native-safe-area-context react-native-svg \
      react-native-linear-gradient react-native-vector-icons react-native-image-picker \
      @react-native-async-storage/async-storage
npm i -D @types/react-native-vector-icons
```
(These are the same as before **plus `@react-native-async-storage/async-storage`**, used to keep users signed in and to remember Settings toggles.)
Then rebuild once, native modules changed: `npx react-native run-android`.

Native setup from earlier still applies: `fonts.gradle` line for vector-icons, CAMERA permission in `AndroidManifest.xml`, and the `Info.plist` keys on iOS.

## 2. Point the app at the server – `src/config.ts`
| Where the app runs | API address |
|---|---|
| Android emulator | `http://10.0.2.2:4000` (already the default) |
| iOS simulator | `http://localhost:4000` (default) |
| **Real phone** | `http://<your PC's LAN IP>:4000` – same Wi-Fi, and allow port 4000 in Windows Firewall. Edit `DEV_URL`. |
| Production | `PROD_URL = 'https://your-domain'` (Android release builds require HTTPS) |

## 3. Run order
1. `cd server && npm run dev`  (watch for “API running on http://localhost:4000”)
2. `npx react-native start` and `npx react-native run-android`
3. Sign in with a dev account (shown on the login screen in dev builds): `admin / admin123`, `vikram / staff123`, `arjun / student123`.

## What talks to the server
Login (role comes from the account) · students / staff CRUD with photo upload · attendance marking per date & batch ·
assessments & performance history · matches (calendar, create/edit/cancel, record results) · dashboards ·
monthly reports (with Share) · change password / admin password reset. Pull down on lists and dashboards to refresh.
The session is saved on the device; if the server says 401 the app signs out automatically.
