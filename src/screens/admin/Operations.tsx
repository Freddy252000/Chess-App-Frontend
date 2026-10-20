import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as api from '../../api';
import { useApi } from '../../hooks/useApi';
import { Screen, Card, Avatar, Badge, ProgressBar, Btn, Muted, SearchBar, Field, Select, SectionTitle, Toggle, Icon, Segmented, Async, Empty } from '../../components/ui';
import { DonutChart, LineChart, MonthLabels } from '../../components/charts';
import { ConfirmDialog } from '../../components/Dialog';
import { useData, useMyStaff } from '../../context/Data';
import { useAuth } from '../../context/Auth';
import { batchesOf, isISODate, signed, todayISO, yesterdayISO } from '../../utils/format';
import { C } from '../../theme';

/* ─── Attendance (admin = pushed with back button, staff = tab) ─── */
export function AttendanceView({ back }: { back?: boolean }) {
  const { role } = useAuth();
  const { students, refresh } = useData();
  const me = useMyStaff();

  const allBatches = Array.from(new Set(['Batch A', 'Batch B', 'Batch C', ...students.map(s => s.batch)])).sort();
  const options = role === 'staff' && batchesOf(me?.batch).length ? batchesOf(me?.batch) : allBatches;

  const [date, setDate] = useState(todayISO());
  const [batch, setBatch] = useState(options[0] ?? 'Batch A');
  useEffect(() => { if (!options.includes(batch)) setBatch(options[0]); }, [options.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const valid = isISODate(date);
  const day = useApi(() => (valid ? api.getDayAttendance(date, batch) : Promise.resolve(null)), [date, batch, valid]);
  const [att, setAtt] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (day.data) setAtt(Object.fromEntries(day.data.students.map(s => [s.id, s.present ?? true])));
    setMsg(null);
  }, [day.data]);

  const list = day.data?.students ?? [];
  const present = list.filter(s => att[s.id] ?? true).length;

  const save = async () => {
    setConfirm(false); setBusy(true);
    try {
      await api.saveAttendance(date, batch, list.map(s => ({ studentId: s.id, present: att[s.id] ?? true })));
      setMsg({ ok: true, text: 'Attendance saved successfully!' });
      refresh(); day.reload();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(false); }
  };

  return (
    <Screen title="Attendance" back={back} onRefresh={day.reload}>
      <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-09-15" autoCapitalize="none" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Btn small variant={date === todayISO() ? 'primary' : 'soft'} label="Today" onPress={() => setDate(todayISO())} />
        <Btn small variant={date === yesterdayISO() ? 'primary' : 'soft'} label="Yesterday" onPress={() => setDate(yesterdayISO())} />
      </View>
      <Select label="Batch" value={batch} options={options} onChange={setBatch} />

      {!valid ? <Muted>Enter a valid date (YYYY-MM-DD).</Muted> : (
        <Async state={day}>
          {d => (
            <>
              <View style={{ backgroundColor: 'rgba(27,67,50,.1)', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: C.green, fontWeight: '500' }}>Present: {present} / {list.length}</Text>
                  <Muted>{d.marked ? 'Already marked – you can edit it' : 'Not marked yet'}</Muted>
                </View>
                <Btn small label="All Present" onPress={() => setAtt(Object.fromEntries(list.map(s => [s.id, true])))} />
              </View>
              {!list.length && <Empty icon="people-outline" title={`No active students in ${batch}`} />}
              {list.map(s => {
                const on = att[s.id] ?? true;
                return (
                  <Card key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar name={s.name} size="sm" uri={s.photo} />
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{s.name}</Text><Muted>{s.id}</Muted></View>
                    <Toggle value={on} onValueChange={v => setAtt(a => ({ ...a, [s.id]: v }))} />
                    <Text style={{ width: 52, textAlign: 'right', fontSize: 12, fontWeight: '500', color: on ? C.green : C.danger }}>{on ? 'Present' : 'Absent'}</Text>
                  </Card>
                );
              })}
              {msg && (
                <View style={{ backgroundColor: msg.ok ? '#F0FDF4' : '#FEF2F2', borderColor: msg.ok ? '#BBF7D0' : '#FECACA', borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Icon name={msg.ok ? 'checkmark' : 'alert-circle-outline'} color={msg.ok ? '#16A34A' : C.danger} size={16} />
                  <Text style={{ flex: 1, color: msg.ok ? '#15803D' : C.danger, fontWeight: '500', fontSize: 14 }}>{msg.text}</Text>
                </View>
              )}
              {!!list.length && <Btn label={busy ? 'Saving…' : 'Save Attendance'} disabled={busy} onPress={() => setConfirm(true)} />}
            </>
          )}
        </Async>
      )}

      <ConfirmDialog visible={confirm} icon="calendar-outline" title="Save attendance?" message={`${present} of ${list.length} students marked present in ${batch} for ${date}.`}
        confirmLabel="Save" onCancel={() => setConfirm(false)} onConfirm={save} />
    </Screen>
  );
}
export const AdminAttendance = () => <AttendanceView back />;

/* ─── Performance overview ─── */
export function AdminPerformance() {
  const nav = useNavigation<any>();
  const { students, refresh } = useData();
  const rep = useApi(() => api.getReportSummary());
  return (
    <Screen title="Performance" back onRefresh={async () => { await Promise.all([refresh(), rep.reload()]); }}>
      <Async state={rep}>
        {r => (
          <>
            <Card style={{ gap: 12 }}>
              <SectionTitle>Academy Average</SectionTitle>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <DonutChart value={r.performance.avg} size={80} />
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: C.text }}>{r.performance.avg}%</Text>
                  <Muted>Overall performance</Muted>
                  <Badge label={`${signed(r.performance.delta)}% this month`} type={r.performance.delta >= 0 ? 'success' : 'danger'} />
                </View>
              </View>
            </Card>
            <Card style={{ gap: 12 }}>
              <SectionTitle>Performance Trend</SectionTitle>
              <LineChart data={r.performance.trend.values} /><MonthLabels labels={r.performance.trend.labels} />
            </Card>
          </>
        )}
      </Async>
      {students.map(s => (
        <TouchableOpacity key={s.id} activeOpacity={0.85} onPress={() => nav.navigate('StudentDetail', { id: s.id })}>
          <Card style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={s.name} size="sm" uri={s.photo} />
              <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{s.name}</Text><Muted>{s.level} · {s.batch}</Muted></View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.green }}>{s.performance}%</Text>
            </View>
            <ProgressBar value={s.performance} color="mint" />
          </Card>
        </TouchableOpacity>
      ))}
    </Screen>
  );
}

/* ─── Password management (admin resets any user's password) ─── */
type U = { id: string; name: string; role: 'admin' | 'staff' | 'student'; photo?: string };
export function PasswordManagement() {
  const { students, staff } = useData();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'staff' | 'student'>('all');
  const [target, setTarget] = useState<U | null>(null);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const users: U[] = [
    { id: 'ADM001', name: 'Admin', role: 'admin' },
    ...staff.map(s => ({ id: s.id, name: s.name, role: 'staff' as const, photo: s.photo })),
    ...students.map(s => ({ id: s.id, name: s.name, role: 'student' as const, photo: s.photo })),
  ];
  const list = users.filter(u => (filter === 'all' || u.role === filter) && (u.name.toLowerCase().includes(q.toLowerCase()) || u.id.toLowerCase().includes(q.toLowerCase())));
  const reset = () => { setTarget(null); setDone(false); setPw(''); setPw2(''); setError(''); };

  const submit = async () => {
    if (!target) return;
    setBusy(true); setError('');
    try { await api.resetPassword(target.id, pw); setDone(true); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  if (target) return (
    <Screen title="Change Password" action={<Btn small variant="ghost" label="Cancel" onPress={reset} />}>
      {done ? (
        <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}><Icon name="checkmark" size={32} color="#16A34A" /></View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: C.text }}>Password Updated</Text>
          <Muted style={{ fontSize: 14 }}>Password changed successfully for {target.name}</Muted>
          <Btn label="Done" onPress={reset} />
        </View>
      ) : (
        <>
          <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: 'rgba(27,67,50,.1)' }}>
            <Icon name="lock-closed-outline" size={22} />
            <View><Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{target.name}</Text><Muted>{target.role} · {target.id}</Muted></View>
          </Card>
          <Field label="New Password" secureTextEntry value={pw} onChangeText={setPw} placeholder="Min. 6 characters" autoCapitalize="none" />
          <Field label="Confirm Password" secureTextEntry value={pw2} onChangeText={setPw2} placeholder="Repeat password" autoCapitalize="none" />
          {!!pw2 && pw !== pw2 && <Text style={{ fontSize: 12, color: C.danger }}>Passwords do not match</Text>}
          {!!error && <Text style={{ fontSize: 13, color: C.danger }}>{error}</Text>}
          <Btn label={busy ? 'Updating…' : 'Update Password'} disabled={busy || pw.length < 6 || pw !== pw2} onPress={submit} />
        </>
      )}
    </Screen>
  );

  return (
    <Screen title="Password Management" back>
      <SearchBar value={q} onChange={setQ} placeholder="Search user..." />
      <Segmented options={['all', 'admin', 'staff', 'student'] as const} value={filter} onChange={setFilter} />
      {list.map(u => (
        <Card key={u.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={u.name} size="sm" uri={u.photo} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{u.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Muted>{u.id}</Muted><Badge label={u.role} type={u.role === 'admin' ? 'primary' : u.role === 'staff' ? 'warning' : 'default'} /></View>
          </View>
          <Btn small variant="soft" icon="key-outline" label="Change" onPress={() => setTarget(u)} />
        </Card>
      ))}
    </Screen>
  );
}
