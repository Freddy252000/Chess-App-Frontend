import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/Auth';
import { DataProvider } from './src/context/Data';
import { PrefsProvider } from './src/context/Prefs';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <PrefsProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <RootNavigator />
          </PrefsProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
