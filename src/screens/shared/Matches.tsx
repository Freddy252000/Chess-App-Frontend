import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Card, Avatar, Badge, Btn, Muted, AddButton, Field, Select, SectionTitle, Segmented, Icon, SuccessView, Empty } from '../../components/ui';
import { ConfirmDialog } from '../../components/Dialog';
import { Match, MatchResult, MatchStatus } from '../../data/types';
import { useData } from '../../context/Data';
import { useAuth } from '../../context/Auth';
import { fmtDate, isISODate, isTime, monthKey, monthTitle, pad, shiftMonth, todayISO } from '../../utils/format';
import { C, display } from '../../theme';

/* ─── helpers ─── */
const TYPE_COLORS: Record<string, [string, string]> = {
  'School Tournament': ['#DBEAFE', '#1D4ED8'], 'Academy Tournament': ['rgba(27,67,50,.1)', C.green],
  'Inter-School Tournament': ['#F3E8FF', '#7E22CE'], 'Friendly Match': ['#FEF3C7', '#B45309'],
};
export const TypePill = ({ type }: { type: string }) => {
  const [bg, fg] = TYPE_COLORS[type] ?? ['#F3F4F6', '#4B5563'];
  return <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, alignSelf: 'flex-start' }}><Text style={{ color: fg, fontSize: 10, fontWeight: '500' }}>{type}</Text></View>;
};
const STATUS_TYPE: Record<MatchStatus, 'info' | 'success' | 'default'> = { Upcoming: 'info', Ongoing: 'success', Completed: 'default' };
export const StatusPill = ({ status }: { status: MatchStatus }) => <Badge label={status} type={STATUS_TYPE[status]} />;

export function MatchCard({ m, onPress, dim }: { m: Match; onPress: () => void; dim?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ opacity: dim ? 0.8 : 1 }}>
      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flex: 1, gap: 4 }}><Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{m.name}</Text><TypePill type={m.type} /></View>
          <StatusPill status={m.status} />
        </View>
        <Muted>📅 {m.date}   🕐 {m.time}</Muted>
        <Muted>📍 {m.venue || 'Venue TBD'}</Muted>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: C.text2 }}>{m.studentIds.length} students · {m.staffIds.length} staff</Text>
          <Icon name="chevron-forward" size={16} color={C.muted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export const ResultGrid = ({ res }: { res: { played: number; wins: number; draws: number; losses: number } }) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>
    {([['Played', res.played], ['Wins', res.wins], ['Draws', res.draws], ['Losses', res.losses]] as const).map(([k, v]) => (
      <View key={k} style={{ flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 8, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{v}</Text><Muted style={{ fontSize: 9 }}>{k}</Muted>
      </View>
    ))}
  </View>
);

/* ─── Admin: calendar + list ─── */
export function AdminMatches() {
  const nav = useNavigation<any>();
  const { matches, refresh } = useData();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [month, setMonth] = useState(monthKey());
  const [sel, setSel] = useState<string | null>(null);
  const open = (id: string) => nav.navigate('MatchDetail', { id });

  const [y, mo] = month.split('-').map(Number);
  const offset = new Date(y, mo - 1, 1).getDay();           // blank cells before the 1st (Sunday = 0)
  const daysInMonth = new Date(y, mo, 0).getDate();
  const byDay = new Map<string, Match[]>();
  matches.forEach(m => byDay.set(m.isoDate, [...(byDay.get(m.isoDate) ?? []), m]));
  const today = todayISO();

  return (
    <Screen title="Matches" onRefresh={refresh} action={<AddButton onPress={() => nav.navigate('CreateMatch')} />}>
      <Segmented<'calendar' | 'list'> options={['calendar', 'list']} value={view} onChange={setView} labels={{ calendar: '📅 Calendar', list: '☰ List' }} />

      {view === 'calendar' ? (
        <>
          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{monthTitle(month)}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => { setMonth(shiftMonth(month, -1)); setSel(null); }} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-back" size={16} /></TouchableOpacity>
                <TouchableOpacity onPress={() => { setMonth(shiftMonth(month, 1)); setSel(null); }} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-forward" size={16} /></TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '600', color: C.muted }}>{d}</Text>)}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[...Array(offset)].map((_, i) => <View key={`b${i}`} style={{ width: `${100 / 7}%`, height: 40 }} />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1, iso = `${month}-${pad(day)}`, has = byDay.has(iso), isSel = sel === iso;
                return (
                  <View key={day} style={{ width: `${100 / 7}%`, height: 40, padding: 2 }}>
                    <TouchableOpacity disabled={!has} onPress={() => setSel(isSel ? null : iso)}
                      style={{ flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: has ? (isSel ? C.greenDark : C.green) : 'transparent', borderWidth: iso === today && !has ? 1 : 0, borderColor: C.green }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: has ? '#fff' : C.text }}>{day}</Text>
                      {has && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.cream, marginTop: 1 }} />}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </Card>

          {sel ? (
            <>
              <SectionTitle>Matches on {fmtDate(sel)}</SectionTitle>
              {(byDay.get(sel) ?? []).map(m => <MatchCard key={m.id} m={m} onPress={() => open(m.id)} />)}
            </>
          ) : (
            <>
              <SectionTitle>Upcoming Matches</SectionTitle>
              {!matches.some(m => m.status !== 'Completed') && <Empty icon="trophy-outline" title="No upcoming matches" sub="Tap + to schedule one." />}
              {matches.filter(m => m.status !== 'Completed').map(m => <MatchCard key={m.id} m={m} onPress={() => open(m.id)} />)}
              {matches.some(m => m.status === 'Completed') && <SectionTitle>Completed</SectionTitle>}
              {matches.filter(m => m.status === 'Completed').reverse().map(m => <MatchCard key={m.id} m={m} dim onPress={() => open(m.id)} />)}
            </>
          )}
        </>
      ) : (
        <>
          {!matches.length && <Empty icon="trophy-outline" title="No matches yet" sub="Tap + to schedule one." />}
          {matches.map(m => (
            <TouchableOpacity key={m.id} onPress={() => open(m.id)}>
              <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: m.status === 'Completed' ? '#F3F4F6' : C.green, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="trophy-outline" color={m.status === 'Completed' ? '#9CA3AF' : '#fff'} />
                </View>
                <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{m.name}</Text><Muted>{m.date} · {m.time}</Muted><Muted>{m.venue}</Muted></View>
                <StatusPill status={m.status} />
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}
    </Screen>
  );
}

/* ─── Admin: create / edit match (3-step wizard) ─── */
type Step = 'form' | 'students' | 'staff' | 'done';
export function CreateMatch() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { students, staff, matches, createMatch, updateMatch } = useData();
  const editing = matches.find(m => m.id === params?.id);

  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    name: editing?.name ?? '', venue: editing?.venue ?? '', type: editing?.type ?? 'School Tournament',
    date: editing?.isoDate ?? '', time: editing?.start ?? '', endTime: editing?.end ?? '',
  });
  const [stu, setStu] = useState<string[]>(editing?.studentIds ?? []);
  const [stf, setStf] = useState<string[]>(editing?.staffIds ?? []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const toggle = (arr: string[], set: (v: string[]) => void, id: string) => set(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  const idx = { form: 0, students: 1, staff: 2, done: 3 }[step];

  const next = () => {
    if (!form.name.trim()) return setError('Match name is required');
    if (!isISODate(form.date)) return setError('Date must look like 2026-09-30');
    if (form.time && !isTime(form.time)) return setError('Start time must look like 09:00 (24 hour)');
    if (form.endTime && !isTime(form.endTime)) return setError('End time must look like 17:00 (24 hour)');
    setError(''); setStep('students');
  };
  const submit = async () => {
    setBusy(true); setError('');
    const payload = { name: form.name.trim(), type: form.type, venue: form.venue.trim(), date: form.date, startTime: form.time, endTime: form.endTime, studentIds: stu, staffIds: stf };
    try { if (editing) await updateMatch(editing.id, payload); else await createMatch(payload); setStep('done'); }
    catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  if (step === 'done') return <SuccessView icon="trophy-outline" title={editing ? 'Match Updated!' : 'Match Created!'} sub={`${form.name}\n${stu.length} students · ${stf.length} staff assigned`} button="Back to Matches" onPress={() => nav.goBack()} />;

  const Pick = ({ items, sel, onToggle }: { items: { id: string; name: string; sub: string; photo?: string }[]; sel: string[]; onToggle: (id: string) => void }) => (
    <>
      <View style={{ backgroundColor: 'rgba(27,67,50,.1)', borderRadius: 12, padding: 12 }}><Text style={{ color: C.green, fontWeight: '500', fontSize: 14 }}>{sel.length} selected</Text></View>
      {items.map(it => {
        const on = sel.includes(it.id);
        return (
          <TouchableOpacity key={it.id} onPress={() => onToggle(it.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: on ? C.green : C.border, backgroundColor: on ? 'rgba(27,67,50,.05)' : '#fff' }}>
            <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: on ? C.green : '#D1D5DB', backgroundColor: on ? C.green : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="checkmark" size={12} color="#fff" />}</View>
            <Avatar name={it.name} size="sm" uri={it.photo} />
            <View><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{it.name}</Text><Muted>{it.sub}</Muted></View>
          </TouchableOpacity>
        );
      })}
    </>
  );

  return (
    <Screen title={editing ? 'Edit Match' : 'Create Match'} back>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {['Details', 'Students', 'Staff'].map((s, i) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: i <= idx ? C.green : C.border, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 10, fontWeight: '700', color: i <= idx ? '#fff' : C.muted }}>{i + 1}</Text></View>
            <Text style={{ fontSize: 12, fontWeight: i === idx ? '600' : '400', color: i === idx ? C.green : C.muted }}>{s}</Text>
            {i < 2 && <View style={{ width: 20, height: 1, backgroundColor: i < idx ? C.green : C.border }} />}
          </View>
        ))}
      </View>

      {step === 'form' && (
        <>
          <Field label="Match Name" placeholder="e.g. School Chess Championship" value={form.name} onChangeText={v => { setForm({ ...form, name: v }); setError(''); }} />
          <Field label="Venue" placeholder="e.g. City Sports Hall, Mumbai" value={form.venue} onChangeText={v => setForm({ ...form, venue: v })} />
          <Select label="Match Type" value={form.type} options={['School Tournament', 'Academy Tournament', 'Inter-School Tournament', 'Friendly Match', 'Practice Match']} onChange={v => setForm({ ...form, type: v })} />
          <Field label="Date (YYYY-MM-DD)" placeholder="2026-09-30" autoCapitalize="none" value={form.date} onChangeText={v => { setForm({ ...form, date: v }); setError(''); }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Field label="Start (24h)" placeholder="09:00" autoCapitalize="none" value={form.time} onChangeText={v => { setForm({ ...form, time: v }); setError(''); }} /></View>
            <View style={{ flex: 1 }}><Field label="End (24h)" placeholder="17:00" autoCapitalize="none" value={form.endTime} onChangeText={v => { setForm({ ...form, endTime: v }); setError(''); }} /></View>
          </View>
          {!!error && <Text style={{ color: C.danger, fontSize: 13 }}>{error}</Text>}
          <Btn label="Next: Select Students →" onPress={next} />
        </>
      )}
      {step === 'students' && (
        <>
          <Pick items={students.map(s => ({ id: s.id, name: s.name, sub: `${s.id} · ${s.level}`, photo: s.photo }))} sel={stu} onToggle={id => toggle(stu, setStu, id)} />
          <Btn label="Next: Select Staff →" onPress={() => setStep('staff')} />
        </>
      )}
      {step === 'staff' && (
        <>
          <Pick items={staff.map(s => ({ id: s.id, name: s.name, sub: `${s.id} · ${s.batch}`, photo: s.photo }))} sel={stf} onToggle={id => toggle(stf, setStf, id)} />
          {!!error && <Text style={{ color: C.danger, fontSize: 13 }}>{error}</Text>}
          <Btn label={busy ? 'Saving…' : editing ? 'Save Changes' : 'Create Match'} disabled={busy} onPress={submit} />
        </>
      )}
    </Screen>
  );
}

/* ─── Match detail: admin edits/cancels; admin & assigned staff record results; everyone else read-only ─── */
const EMPTY = { played: '', wins: '', draws: '', losses: '', points: '', rank: '' };
export function MatchDetail() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { role, user } = useAuth();
  const { matches, students, staff, cancelMatch, saveResult } = useData();
  const m = matches.find(x => x.id === params.id);

  const [showForm, setShowForm] = useState(false);
  const [who, setWho] = useState(m?.studentIds[0] ?? '');
  const [r, setR] = useState<Record<string, string>>(EMPTY);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  // pre-fill the form with an existing result when the selected student changes
  useEffect(() => {
    const ex = m?.results?.[who];
    setR(ex ? { played: String(ex.played), wins: String(ex.wins), draws: String(ex.draws), losses: String(ex.losses), points: ex.points, rank: ex.rank } : EMPTY);
  }, [who, m?.results]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cancelled) return <SuccessView icon="close" title="Match Cancelled" sub="The match has been removed from the schedule." button="Back to Matches" onPress={() => nav.goBack()} />;
  if (!m) return <Screen title="Match Details" back><Empty icon="trophy-outline" title="Match not found" /></Screen>;

  const nameOf = (id: string) => students.find(s => s.id === id)?.name ?? id;
  const canRecord = role === 'admin' || (role === 'staff' && m.staffIds.includes(user?.refId ?? ''));

  const save = async () => {
    const n = (v: string) => (v.trim() === '' ? NaN : Number(v));
    const res: MatchResult = { played: n(r.played), wins: n(r.wins), draws: n(r.draws), losses: n(r.losses), points: r.points.trim(), rank: r.rank.trim() };
    if ([res.played, res.wins, res.draws, res.losses].some(v => !Number.isInteger(v) || v < 0)) return setMsg({ ok: false, text: 'Played, wins, draws and losses must be whole numbers' });
    if (res.wins + res.draws + res.losses > res.played) return setMsg({ ok: false, text: 'Wins + draws + losses cannot be more than games played' });
    setBusy(true);
    try { await saveResult(m.id, who, res); setMsg({ ok: true, text: `Result saved for ${nameOf(who)}` }); }
    catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
  };

  return (
    <Screen title="Match Details" back>
      <LinearGradient colors={[C.green, C.greenDark]} style={{ borderRadius: 16, padding: 20, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><TypePill type={m.type} /><StatusPill status={m.status} /></View>
        <Text style={{ color: '#fff', fontSize: 20, fontFamily: display, marginTop: 8 }}>{m.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginTop: 8 }}>📅 {m.date}     🕐 {m.time}{m.endTime !== 'TBD' ? `–${m.endTime}` : ''}</Text>
        <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>📍 {m.venue || 'Venue TBD'}</Text>
      </LinearGradient>

      <Card>
        <SectionTitle>Participating Students</SectionTitle>
        {!m.studentIds.length && <Muted style={{ marginTop: 8 }}>No students assigned.</Muted>}
        {m.studentIds.map((sid, i) => {
          const s = students.find(x => x.id === sid);
          const res = m.results?.[sid];
          return (
            <View key={sid} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
              <Avatar name={s?.name ?? sid} size="sm" uri={s?.photo} />
              <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{s?.name ?? sid}</Text><Muted>{sid}{s ? ` · ${s.level}` : ''}</Muted></View>
              {res && <View style={{ alignItems: 'flex-end' }}><Text style={{ fontSize: 12, fontWeight: '700', color: C.green }}>{res.rank}</Text><Muted style={{ fontSize: 10 }}>{res.points} pts</Muted></View>}
            </View>
          );
        })}
      </Card>

      <Card>
        <SectionTitle>Assigned Staff</SectionTitle>
        {!m.staffIds.length && <Muted style={{ marginTop: 8 }}>No staff assigned.</Muted>}
        {m.staffIds.map((sid, i) => {
          const s = staff.find(x => x.id === sid);
          return (
            <View key={sid} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
              <Avatar name={s?.name ?? sid} size="sm" uri={s?.photo} /><View><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{s?.name ?? sid}</Text><Muted>{sid}{s ? ` · ${s.batch}` : ''}</Muted></View>
            </View>
          );
        })}
      </Card>

      {m.results && (
        <Card style={{ gap: 12 }}>
          <SectionTitle>Match Results</SectionTitle>
          {m.studentIds.filter(id => m.results![id]).map(sid => {
            const res = m.results![sid];
            return (
              <View key={sid} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar name={nameOf(sid)} size="sm" uri={students.find(s => s.id === sid)?.photo} />
                  <View style={{ gap: 4 }}><Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{nameOf(sid)}</Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}><Badge label={res.rank} type={res.rank === '1st' ? 'success' : 'primary'} /><Badge label={`${res.points} pts`} /></View></View>
                </View>
                <ResultGrid res={res} />
              </View>
            );
          })}
        </Card>
      )}

      {canRecord && m.studentIds.length > 0 && (showForm ? (
        <Card style={{ gap: 12 }}>
          <SectionTitle>Record Result</SectionTitle>
          <Select label="Student" value={nameOf(who)} options={m.studentIds.map(nameOf)} onChange={n => setWho(m.studentIds.find(id => nameOf(id) === n) ?? who)} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {([['Games Played', 'played'], ['Wins', 'wins'], ['Draws', 'draws'], ['Losses', 'losses'], ['Points', 'points'], ['Rank', 'rank']] as const).map(([label, key]) => (
              <View key={key} style={{ width: '47%' }}>
                <Field label={label} value={r[key]} onChangeText={v => { setR({ ...r, [key]: v }); setMsg(null); }} keyboardType={key === 'points' || key === 'rank' ? 'default' : 'number-pad'} placeholder={key === 'points' ? '3.5/5' : key === 'rank' ? '1st' : '0'} />
              </View>
            ))}
          </View>
          {msg && <Text style={{ color: msg.ok ? '#15803D' : C.danger, fontSize: 13 }}>{msg.text}</Text>}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Btn variant="ghost" label="Close" style={{ flex: 1 }} onPress={() => { setShowForm(false); setMsg(null); }} />
            <Btn label={busy ? 'Saving…' : 'Save Result'} disabled={busy} style={{ flex: 1 }} onPress={save} />
          </View>
        </Card>
      ) : (
        <TouchableOpacity onPress={() => setShowForm(true)} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, backgroundColor: 'rgba(240,217,181,.5)', borderWidth: 1, borderColor: 'rgba(181,136,99,.4)' }}>
          <Icon name="star" size={16} color={C.brown} /><Text style={{ color: C.brown, fontWeight: '500', fontSize: 14 }}>Record Match Result</Text>
        </TouchableOpacity>
      ))}

      {role === 'admin' && (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Btn variant="ghost" icon="create-outline" label="Edit" style={{ flex: 1 }} onPress={() => nav.navigate('CreateMatch', { id: m.id })} />
          <Btn variant="danger" icon="close" label="Cancel Match" style={{ flex: 1 }} onPress={() => setConfirmCancel(true)} />
        </View>
      )}

      <ConfirmDialog visible={confirmCancel} danger title="Cancel this match?" message={`${m.name} and any recorded results will be removed.`} confirmLabel="Cancel Match" cancelLabel="Keep"
        onCancel={() => setConfirmCancel(false)} onConfirm={async () => { setConfirmCancel(false); try { await cancelMatch(m.id); setCancelled(true); } catch (e: any) { setMsg({ ok: false, text: e.message }); } }} />
    </Screen>
  );
}
