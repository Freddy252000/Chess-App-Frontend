import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Card, Avatar, Badge, Muted, IconBox, Icon, IconName, SectionTitle, ToggleRow } from '../../components/ui';
import { ChessPawn } from '../../components/ChessPieces';
import { ConfirmDialog, Dialog } from '../../components/Dialog';
import { useAuth } from '../../context/Auth';
import { useData } from '../../context/Data';
import { usePrefs } from '../../context/Prefs';
import { C } from '../../theme';

export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const { user, role, logout } = useAuth();
  const { students, staff } = useData();
  const { prefs, setPref } = usePrefs();
  const [dlg, setDlg] = useState<null | 'logout' | 'about' | 'help' | 'profile'>(null);

  const photo = students.find(s => s.id === user?.refId)?.photo ?? staff.find(s => s.id === user?.refId)?.photo;
  const roleLabel = (role ?? '').charAt(0).toUpperCase() + (role ?? '').slice(1);

  const items: { icon: IconName; label: string; sub: string; onPress: () => void }[] = [
    {
      icon: 'person-outline', label: 'My Profile', sub: 'View your profile',
      onPress: () => role === 'student' ? nav.navigate('StudentProfile') : role === 'staff' ? nav.navigate('StaffDetail', { id: user?.refId }) : setDlg('profile'),
    },
    ...(role === 'student' ? [{ icon: 'document-text-outline' as IconName, label: 'My Reports', sub: 'Monthly & assessment reports', onPress: () => nav.navigate('StudentReports') }] : []),
    ...(role === 'admin' ? [
      { icon: 'key-outline' as IconName, label: 'Password Management', sub: 'Change user passwords', onPress: () => nav.navigate('PasswordMgmt') },
      { icon: 'people-outline' as IconName, label: 'Staff Management', sub: 'View, add and edit staff', onPress: () => nav.navigate('StaffList') },
    ] : []),
    { icon: 'lock-closed-outline', label: 'Change Password', sub: 'Update your sign-in password', onPress: () => nav.navigate('ChangePassword') },
    { icon: 'help-circle-outline', label: 'Help & Support', sub: 'FAQs, contact support', onPress: () => setDlg('help') },
    { icon: 'information-circle-outline', label: 'About', sub: 'Chess Academy v2.0', onPress: () => setDlg('about') },
  ];

  return (
    <Screen title="Settings">
      <LinearGradient colors={[C.green, C.greenDark]} style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: 16, bottom: 0, opacity: 0.12 }}><ChessPawn size={64} color="#fff" /></View>
        <Avatar name={user?.name ?? ''} size="lg" uri={photo} />
        <View style={{ gap: 4 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{user?.name}</Text>
          <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>{user?.refId} · @{user?.username}</Text>
          <Badge label={roleLabel} />
        </View>
      </LinearGradient>

      <View style={{ gap: 8 }}>
        <SectionTitle>Preferences</SectionTitle>
        <Card style={{ paddingVertical: 4 }}>
          <ToggleRow label="Push Notifications" sub="Alerts and announcements" value={prefs.push} onValueChange={v => setPref('push', v)} />
          <ToggleRow label="Class Reminders" sub="Remind me before each class" value={prefs.classReminders} onValueChange={v => setPref('classReminders', v)} />
          <ToggleRow label="Match Alerts" sub="Upcoming tournaments & results" value={prefs.matchAlerts} onValueChange={v => setPref('matchAlerts', v)} />
          <ToggleRow label="Sound" sub="Play notification sounds" value={prefs.sound} onValueChange={v => setPref('sound', v)} />
          <ToggleRow label="Biometric Login" sub="Fingerprint / Face ID" value={prefs.biometric} onValueChange={v => setPref('biometric', v)} last />
        </Card>
      </View>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {items.map((it, i) => (
          <TouchableOpacity key={it.label} onPress={it.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
            <IconBox name={it.icon} />
            <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{it.label}</Text><Muted>{it.sub}</Muted></View>
            <Icon name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        ))}
      </Card>

      <TouchableOpacity onPress={() => setDlg('logout')} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox name="log-out-outline" bg="#FEF2F2" color={C.danger} />
        <Text style={{ color: C.danger, fontWeight: '500', fontSize: 14 }}>Logout</Text>
      </TouchableOpacity>

      <Muted style={{ textAlign: 'center', fontSize: 10 }}>Version 2.0.0 · © 2026 Chess Academy</Muted>

      <ConfirmDialog visible={dlg === 'logout'} danger icon="log-out-outline" title="Log out?" message="You will need to sign in again to continue."
        confirmLabel="Logout" onCancel={() => setDlg(null)} onConfirm={() => { setDlg(null); logout(); }} />
      <Dialog visible={dlg === 'about'} onClose={() => setDlg(null)} icon="information-circle-outline" title="Chess Academy"
        message={'Version 2.0.0\nManage students, staff, attendance, performance and tournaments in one place.'} actions={[{ label: 'Close', variant: 'primary', onPress: () => setDlg(null) }]} />
      <Dialog visible={dlg === 'help'} onClose={() => setDlg(null)} icon="help-circle-outline" title="Help & Support"
        message={'Email: support@chessacademy.com\nPhone: +91 98765 00000\nMon–Sat, 9 AM – 6 PM'} actions={[{ label: 'Close', variant: 'primary', onPress: () => setDlg(null) }]} />
      <Dialog visible={dlg === 'profile'} onClose={() => setDlg(null)} icon="person-outline" title={user?.name ?? 'Profile'}
        message={`ID: ${user?.refId}\nUsername: ${user?.username}\nRole: ${roleLabel}`} actions={[{ label: 'Close', variant: 'primary', onPress: () => setDlg(null) }]} />
    </Screen>
  );
}
