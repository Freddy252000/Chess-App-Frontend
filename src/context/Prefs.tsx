import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Prefs = { push: boolean; classReminders: boolean; matchAlerts: boolean; sound: boolean; biometric: boolean };
type Ctx = { prefs: Prefs; setPref: (k: keyof Prefs, v: boolean) => void };
const PrefsCtx = createContext<Ctx>(null as unknown as Ctx);
const KEY = '@chess/prefs';
const DEFAULTS: Prefs = { push: true, classReminders: true, matchAlerts: true, sound: false, biometric: false };

export const PrefsProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => { if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) }); }).catch(() => {});
  }, []);
  const setPref = (k: keyof Prefs, v: boolean) => setPrefs(p => {
    const next = { ...p, [k]: v };
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
    return next;
  });
  return <PrefsCtx.Provider value={{ prefs, setPref }}>{children}</PrefsCtx.Provider>;
};
export const usePrefs = () => useContext(PrefsCtx);
