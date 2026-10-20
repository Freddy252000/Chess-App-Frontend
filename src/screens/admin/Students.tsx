import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen, Card, Avatar, Badge, ProgressBar, Btn, Muted, SearchBar, AddButton, Field, Select, SectionTitle, InfoCard, SuccessView, Segmented, ToggleRow, Empty } from '../../components/ui';
import { AttendancePanel, PerformancePanel } from '../../components/StudentPanels';
import { PhotoPicker } from '../../components/PhotoPicker';
import { ConfirmDialog } from '../../components/Dialog';
import { useData } from '../../context/Data';
import { Student } from '../../data/types';
import { C } from '../../theme';

/* ─── List ─── */
export function StudentManagement() {
  const nav = useNavigation<any>();
  const { students, deleteStudent, refresh } = useData();
  const [q, setQ] = useState('');
  const [del, setDel] = useState<Student | null>(null);
  const list = students.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen title="Students" onRefresh={refresh} action={<AddButton onPress={() => nav.navigate('AddStudent')} />}>
      <SearchBar value={q} onChange={setQ} placeholder="Search students..." />
      <Muted>{list.length} students</Muted>
      {!list.length && <Empty icon="people-outline" title="No students found" />}
      {list.map(s => (
        <Card key={s.id} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={s.name} uri={s.photo} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600', fontSize: 14, color: C.text }}>{s.name}</Text>
                <Badge label={s.status} type={s.status === 'Active' ? 'success' : 'default'} />
              </View>
              <Muted>{s.id} · {s.level}</Muted>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Muted>Attendance</Muted>
              <ProgressBar value={s.attendance} color={s.attendance > 85 ? 'green' : s.attendance > 70 ? 'warning' : 'danger'} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: C.text2 }}>{s.attendance}%</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Muted>Performance</Muted>
              <ProgressBar value={s.performance} color="mint" />
              <Text style={{ fontSize: 12, fontWeight: '500', color: C.text2 }}>{s.performance}%</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn small variant="soft" icon="eye-outline" label="View" style={{ flex: 1 }} onPress={() => nav.navigate('StudentDetail', { id: s.id })} />
            <Btn small variant="ghost" icon="create-outline" label="Edit" style={{ flex: 1 }} onPress={() => nav.navigate('AddStudent', { id: s.id })} />
            <Btn small variant="danger" icon="trash-outline" style={{ width: 40 }} onPress={() => setDel(s)} />
          </View>
        </Card>
      ))}
      <ConfirmDialog visible={!!del} danger title="Delete student?" message={`${del?.name ?? ''} and their login will be removed. This can't be undone.`}
        confirmLabel="Delete" onCancel={() => setDel(null)} onConfirm={async () => { const d = del; setDel(null); if (d) await deleteStudent(d.id); }} />
    </Screen>
  );
}

/* ─── Add / Edit ─── */
const TEXT_FIELDS = [
  { label: 'Full Name', key: 'name', ph: 'e.g. Arjun Mehta' },
  { label: 'Date of Birth', key: 'dob', ph: 'DD/MM/YYYY' },
  { label: 'Phone Number', key: 'phone', ph: '+91 98765 43210', kb: 'phone-pad' },
  { label: 'Parent/Guardian Name', key: 'parent', ph: 'e.g. Rajesh Mehta' },
  { label: 'Parent/Guardian Contact', key: 'parentPhone', ph: '+91 98765 43211', kb: 'phone-pad' },
  { label: 'Email', key: 'email', ph: 'student@mail.com', kb: 'email-address' },
  { label: 'Address', key: 'address', ph: 'Full address' },
  { label: 'Joining Date', key: 'joined', ph: 'e.g. Oct 2026' },
] as const;

export function AddStudent() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { students, addStudent, updateStudent } = useData();
  const editing = students.find(s => s.id === params?.id);

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const [active, setActive] = useState(editing ? editing.status === 'Active' : true);
  const [form, setForm] = useState<Record<string, string>>({
    name: editing?.name ?? '', dob: editing?.dob ?? '', phone: editing?.phone ?? '', parent: editing?.parent ?? '', parentPhone: editing?.parentPhone ?? '',
    email: editing?.email ?? '', address: editing?.address ?? '', joined: editing?.joined ?? '',
    gender: editing?.gender ?? 'Male', level: editing?.level ?? 'Beginner', batch: editing?.batch ?? 'Batch A',
    username: editing?.username ?? '', password: '',
  });
  const set = (k: string) => (v: string) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const submit = async () => {
    if (!form.name.trim()) return setError('Full name is required');
    if (!editing && (!form.username.trim() || form.password.length < 6))
      return setError('A username and a password (min 6 characters) are required so the student can log in');
    setBusy(true); setError('');
    try {
      const payload = {
        name: form.name.trim(), phone: form.phone, parent: form.parent, parentPhone: form.parentPhone, email: form.email,
        address: form.address, joined: form.joined || undefined, gender: form.gender, level: form.level, batch: form.batch,
        status: active ? 'Active' : 'Inactive', photo, dob: form.dob || undefined,
        username: form.username.trim() || undefined, password: form.password || undefined,
      };
      if (editing) await updateStudent(editing.id, payload); else await addStudent(payload);
      setSaved(true);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally { setBusy(false); }
  };

  if (saved) return <SuccessView title={editing ? 'Student Updated!' : 'Student Added!'} sub={editing ? 'Changes have been saved.' : `${form.name} has been registered and can now log in as "${form.username}".`} button="Back to Students" onPress={() => nav.goBack()} />;

  return (
    <Screen title={editing ? 'Edit Student' : 'Add Student'} back>
      <PhotoPicker name={form.name} uri={photo} onChange={setPhoto} />
      {TEXT_FIELDS.map(f => (
        <Field key={f.key} label={f.label} placeholder={f.ph} value={form[f.key]} onChangeText={set(f.key)}
          keyboardType={'kb' in f ? f.kb : 'default'} autoCapitalize={f.key === 'email' ? 'none' : 'sentences'} />
      ))}
      <Select label="Gender" value={form.gender} options={['Male', 'Female', 'Other']} onChange={set('gender')} />
      <Select label="Chess Level" value={form.level} options={['Beginner', 'Intermediate', 'Advanced']} onChange={set('level')} />
      <Select label="Class/Batch" value={form.batch} options={['Batch A', 'Batch B', 'Batch C']} onChange={set('batch')} />
      <Card style={{ paddingVertical: 0 }}><ToggleRow label="Active" sub="Inactive students are hidden from attendance" value={active} onValueChange={setActive} last /></Card>

      <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 16, gap: 12 }}>
        <SectionTitle>Login Credentials</SectionTitle>
        <Field label="Username" placeholder="username" autoCapitalize="none" autoCorrect={false} value={form.username} onChangeText={set('username')} />
        <Field label={editing ? 'New Password (leave blank to keep)' : 'Password'} placeholder="••••••••" secureTextEntry value={form.password} onChangeText={set('password')} />
      </View>
      {!!error && <Text style={{ color: C.danger, fontSize: 13 }}>{error}</Text>}
      <Btn label={busy ? 'Saving…' : editing ? 'Save Changes' : 'Save Student'} disabled={busy} onPress={submit} />
    </Screen>
  );
}

/* ─── Detail ─── */
export function StudentDetail() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { students } = useData();
  const s = students.find(x => x.id === params.id);
  const [tab, setTab] = useState<'profile' | 'attendance' | 'performance'>('profile');
  if (!s) return <Screen title="Student Profile" back><Empty icon="people-outline" title="Student not found" /></Screen>;

  return (
    <Screen title="Student Profile" back action={<Btn small variant="soft" icon="create-outline" label="Edit" onPress={() => nav.navigate('AddStudent', { id: s.id })} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={s.name} size="lg" uri={s.photo} />
        <View style={{ gap: 4, flex: 1 }}>
          <Text style={{ fontSize: 18, color: C.text, fontWeight: '600' }}>{s.name}</Text>
          <Muted>{s.id} · {s.batch}</Muted>
          <View style={{ flexDirection: 'row', gap: 8 }}><Badge label={s.level} type="primary" /><Badge label={s.status} type={s.status === 'Active' ? 'success' : 'default'} /></View>
        </View>
      </View>
      <Segmented options={['profile', 'attendance', 'performance'] as const} value={tab} onChange={setTab} />

      {tab === 'profile' && (
        <>
          <InfoCard title="Contact Information" rows={[['Phone', s.phone || '—'], ['Email', s.email || '—'], ['Address', s.address || '—'], ['Parent/Guardian', s.parent || '—'], ['Parent Contact', s.parentPhone || '—']]} />
          <InfoCard title="Academy Info" rows={[['Username', s.username || '—'], ['Chess Level', s.level], ['Batch', s.batch], ['Joined', s.joined], ['Age', `${s.age} years`]]} />
        </>
      )}
      {tab === 'attendance' && <AttendancePanel studentId={s.id} />}
      {tab === 'performance' && <PerformancePanel studentId={s.id} canAdd />}
    </Screen>
  );
}
