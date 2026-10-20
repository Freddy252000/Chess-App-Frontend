import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen, Card, Avatar, Badge, Btn, Muted, AddButton, Field, Select, SectionTitle, InfoCard, SuccessView, ToggleRow, Empty } from '../../components/ui';
import { PhotoPicker } from '../../components/PhotoPicker';
import { ConfirmDialog } from '../../components/Dialog';
import { useData } from '../../context/Data';
import { useAuth } from '../../context/Auth';
import { StaffMember } from '../../data/types';
import { C } from '../../theme';

export function StaffList() {
  const nav = useNavigation<any>();
  const { staff, deleteStaff } = useData();
  const [del, setDel] = useState<StaffMember | null>(null);
  return (
    <Screen title="Staff" back action={<AddButton onPress={() => nav.navigate('AddStaff')} />}>
      {!staff.length && <Empty icon="people-outline" title="No staff yet" />}
      {staff.map(s => (
        <Card key={s.id} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={s.name} uri={s.photo} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600', fontSize: 14, color: C.text }}>{s.name}</Text>
                <Badge label={s.status} type={s.status === 'Active' ? 'success' : 'default'} />
              </View>
              <Muted>{s.id} · {s.batch}</Muted>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 8 }}><Muted>Email</Muted><Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '500', color: C.text }}>{s.email || '—'}</Text></View>
            <View style={{ flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 8 }}><Muted>Students</Muted><Text style={{ fontSize: 12, fontWeight: '500', color: C.text }}>{s.students} assigned</Text></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn small variant="soft" icon="eye-outline" label="View" style={{ flex: 1 }} onPress={() => nav.navigate('StaffDetail', { id: s.id })} />
            <Btn small variant="ghost" icon="create-outline" label="Edit" style={{ flex: 1 }} onPress={() => nav.navigate('AddStaff', { id: s.id })} />
            <Btn small variant="danger" icon="trash-outline" style={{ width: 40 }} onPress={() => setDel(s)} />
          </View>
        </Card>
      ))}
      <ConfirmDialog visible={!!del} danger title="Delete staff member?" message={`${del?.name ?? ''} and their login will be removed. This can't be undone.`}
        confirmLabel="Delete" onCancel={() => setDel(null)} onConfirm={async () => { const d = del; setDel(null); if (d) await deleteStaff(d.id); }} />
    </Screen>
  );
}

export function AddStaff() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { staff, addStaff, updateStaff } = useData();
  const editing = staff.find(s => s.id === params?.id);

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const [active, setActive] = useState(editing ? editing.status === 'Active' : true);
  const [f, setF] = useState<Record<string, string>>({
    name: editing?.name ?? '', email: editing?.email ?? '', phone: editing?.phone ?? '', address: editing?.address ?? '',
    joined: editing?.joined ?? '', batch: editing?.batch ?? 'Batch A', username: editing?.username ?? '', password: '',
  });
  const set = (k: string) => (v: string) => { setF(p => ({ ...p, [k]: v })); setError(''); };

  const submit = async () => {
    if (!f.name.trim()) return setError('Full name is required');
    if (!editing && (!f.username.trim() || f.password.length < 6))
      return setError('A username and a password (min 6 characters) are required so the staff member can log in');
    setBusy(true); setError('');
    try {
      const payload = {
        name: f.name.trim(), email: f.email, phone: f.phone, address: f.address, joined: f.joined || undefined, batch: f.batch,
        status: active ? 'Active' : 'Inactive', photo, username: f.username.trim() || undefined, password: f.password || undefined,
      };
      if (editing) await updateStaff(editing.id, payload); else await addStaff(payload);
      setSaved(true);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally { setBusy(false); }
  };

  if (saved) return <SuccessView title={editing ? 'Staff Updated!' : 'Staff Added!'} sub={editing ? 'Changes have been saved.' : `${f.name} has been registered and can now log in as "${f.username}".`} button="Back to Staff" onPress={() => nav.goBack()} />;

  return (
    <Screen title={editing ? 'Edit Staff' : 'Add Staff'} back>
      <PhotoPicker name={f.name} uri={photo} onChange={setPhoto} />
      <Field label="Full Name" placeholder="e.g. Vikram Singh" value={f.name} onChangeText={set('name')} />
      <Field label="Email" placeholder="staff@academy.com" autoCapitalize="none" keyboardType="email-address" value={f.email} onChangeText={set('email')} />
      <Field label="Phone Number" placeholder="+91 99887 76655" keyboardType="phone-pad" value={f.phone} onChangeText={set('phone')} />
      <Field label="Address" placeholder="Full address" value={f.address} onChangeText={set('address')} />
      <Field label="Joining Date" placeholder="e.g. Oct 2026" value={f.joined} onChangeText={set('joined')} />
      <Select label="Assigned Class/Batch" value={f.batch} options={['Batch A', 'Batch B', 'Batch C', 'Batch A, B', 'Batch B, C']} onChange={set('batch')} />
      <Card style={{ paddingVertical: 0 }}><ToggleRow label="Active" sub="Inactive staff can't be assigned to matches" value={active} onValueChange={setActive} last /></Card>
      <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 16, gap: 12 }}>
        <SectionTitle>Login Credentials</SectionTitle>
        <Field label="Username" placeholder="username" autoCapitalize="none" autoCorrect={false} value={f.username} onChangeText={set('username')} />
        <Field label={editing ? 'New Password (leave blank to keep)' : 'Password'} placeholder="••••••••" secureTextEntry value={f.password} onChangeText={set('password')} />
      </View>
      {!!error && <Text style={{ color: C.danger, fontSize: 13 }}>{error}</Text>}
      <Btn label={busy ? 'Saving…' : editing ? 'Save Changes' : 'Save Staff'} disabled={busy} onPress={submit} />
    </Screen>
  );
}

export function StaffDetail() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { role } = useAuth();
  const { staff, students } = useData();
  const s = staff.find(x => x.id === params.id) ?? staff[0];
  if (!s) return null;
  return (
    <Screen title="Staff Profile" back action={role === 'admin' ? <Btn small variant="soft" icon="create-outline" label="Edit" onPress={() => nav.navigate('AddStaff', { id: s.id })} /> : undefined}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar name={s.name} size="lg" uri={s.photo} />
        <View style={{ gap: 4, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: C.text }}>{s.name}</Text>
          <Muted>{s.id}</Muted>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}><Badge label={s.status} type={s.status === 'Active' ? 'success' : 'default'} /><Badge label="Instructor" type="primary" /></View>
        </View>
      </Card>
      <InfoCard title="Contact" rows={[['Username', s.username || '—'], ['Email', s.email || '—'], ['Phone', s.phone || '—'], ['Address', s.address || '—'], ['Joined', s.joined]]} />
      <InfoCard title="Assignment" rows={[['Assigned Batch', s.batch], ['Total Students', s.students]]} />
      <Card>
        <SectionTitle>Recent Students</SectionTitle>
        {students.slice(0, 3).map((st, i) => (
          <View key={st.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
            <Avatar name={st.name} size="sm" uri={st.photo} />
            <View style={{ flex: 1 }}><Text style={{ fontSize: 12, fontWeight: '500', color: C.text }}>{st.name}</Text><Muted style={{ fontSize: 10 }}>{st.level}</Muted></View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.green }}>{st.performance}%</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
