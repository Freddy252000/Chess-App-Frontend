import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/Auth';
import { ChessKing } from '../../components/ChessPieces';
import { Field, Icon, Btn, Card } from '../../components/ui';
import { C, display, shadow } from '../../theme';

// Accounts created by `server/src/seed.ts` on the first server start (shown in dev builds only)
const DEMO = [
  { role: 'Admin', username: 'admin', password: 'admin123' },
  { role: 'Staff', username: 'vikram', password: 'staff123' },
  { role: 'Student', username: 'arjun', password: 'student123' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!username.trim() || !password) return setError('Enter your username and password');
    setError(''); setLoading(true);
    try {
      await login(username, password); // role (admin / staff / student) comes back from the API
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView bounces={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={[C.green, C.greenDark]} style={{ height: 250 + insets.top, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 28 }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...shadow }}>
            <ChessKing size={52} />
          </View>
          <Text style={{ color: '#fff', fontSize: 26, fontFamily: display }}>Chess Academy</Text>
          <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginTop: 4 }}>Management System</Text>
        </LinearGradient>

        <View style={{ padding: 24, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '600', color: C.text }}>Welcome back</Text>
            <Text style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Sign in with your username</Text>
          </View>

          <Field label="Username" value={username} onChangeText={t => { setUsername(t); setError(''); }} placeholder="Enter your username" autoCapitalize="none" autoCorrect={false} />
          <View>
            <Field label="Password" value={password} onChangeText={t => { setPassword(t); setError(''); }} secureTextEntry={!showPw} placeholder="••••••••" autoCapitalize="none" onSubmitEditing={submit} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, bottom: 12 }}>
              <Icon name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.muted} />
            </TouchableOpacity>
          </View>

          {!!error && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12 }}>
              <Icon name="alert-circle-outline" size={18} color={C.danger} />
              <Text style={{ flex: 1, color: C.danger, fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <TouchableOpacity style={{ alignSelf: 'flex-end' }}><Text style={{ color: C.green, fontSize: 14, fontWeight: '500' }}>Forgot Password?</Text></TouchableOpacity>

          <Btn label={loading ? undefined : 'Sign In'} onPress={submit} disabled={loading} />
          {loading && <ActivityIndicator color={C.green} />}

          {__DEV__ && <Card style={{ backgroundColor: C.bg, gap: 8, padding: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.text2 }}>Demo accounts from the server seed (dev only)</Text>
            {DEMO.map(d => (
              <TouchableOpacity key={d.username} onPress={() => { setUsername(d.username); setPassword(d.password); setError(''); }} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: C.green, fontWeight: '600' }}>{d.role}</Text>
                <Text style={{ fontSize: 12, color: C.text2 }}>{d.username} / {d.password}</Text>
              </TouchableOpacity>
            ))}
          </Card>}
          <Text style={{ textAlign: 'center', fontSize: 12, color: C.muted }}>Chess Academy v2.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
