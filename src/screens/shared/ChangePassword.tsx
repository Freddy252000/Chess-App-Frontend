import React, { useState } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as api from '../../api';
import { Screen, Field, Btn, SuccessView } from '../../components/ui';
import { C } from '../../theme';

export default function ChangePassword() {
  const nav = useNavigation<any>();
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (pw.length < 6) return setError('New password must be at least 6 characters');
    if (pw !== pw2) return setError('Passwords do not match');
    setBusy(true); setError('');
    try { await api.changeMyPassword(cur, pw); setDone(true); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  if (done) return <SuccessView title="Password changed" sub="Use your new password next time you sign in." button="Done" onPress={() => nav.goBack()} />;
  return (
    <Screen title="Change Password" back>
      <Field label="Current Password" secureTextEntry value={cur} onChangeText={t => { setCur(t); setError(''); }} autoCapitalize="none" />
      <Field label="New Password" secureTextEntry value={pw} onChangeText={t => { setPw(t); setError(''); }} placeholder="Min. 6 characters" autoCapitalize="none" />
      <Field label="Confirm New Password" secureTextEntry value={pw2} onChangeText={t => { setPw2(t); setError(''); }} autoCapitalize="none" />
      {!!error && <Text style={{ color: C.danger, fontSize: 13 }}>{error}</Text>}
      <Btn label={busy ? 'Updating…' : 'Update Password'} disabled={busy || !cur || !pw} onPress={submit} />
    </Screen>
  );
}
