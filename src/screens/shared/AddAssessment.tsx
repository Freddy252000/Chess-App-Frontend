import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as api from '../../api';
import { Screen, Field, Btn, SuccessView, SectionTitle, Card, Avatar, Muted } from '../../components/ui';
import { useData } from '../../context/Data';
import { isISODate, todayISO } from '../../utils/format';
import { C } from '../../theme';

const SKILLS = [['tactics', 'Tactical Skills'], ['openings', 'Opening Theory'], ['endgame', 'Endgame Play'], ['analysis', 'Game Analysis'], ['tournament', 'Tournament Play']] as const;

export default function AddAssessment() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { students, refresh } = useData();
  const s = students.find(x => x.id === params.studentId);
  const [f, setF] = useState<Record<string, string>>({ date: todayISO(), score: '', comments: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const set = (k: string) => (v: string) => { setF(p => ({ ...p, [k]: v })); setError(''); };

  const num = (v?: string) => (v === undefined || v === '' ? undefined : Number(v));
  const bad = (v?: number) => v !== undefined && (!Number.isInteger(v) || v < 0 || v > 100);

  const submit = async () => {
    const score = num(f.score);
    if (score === undefined || bad(score)) return setError('Overall score must be a whole number from 0 to 100');
    if (!isISODate(f.date)) return setError('Date must look like 2026-09-15');
    const skills: Record<string, number | undefined> = {};
    for (const [k, label] of SKILLS) {
      skills[k] = num(f[k]);
      if (bad(skills[k])) return setError(`${label} must be a whole number from 0 to 100`);
    }
    setBusy(true);
    try {
      await api.addAssessment(params.studentId, { date: f.date, score, ...skills, comments: f.comments.trim() || undefined });
      await refresh();
      setSaved(true);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  if (saved) return <SuccessView title="Assessment saved" sub={`${s?.name ?? 'The student'}'s performance has been updated.`} button="Done" onPress={() => nav.goBack()} />;

  return (
    <Screen title="Add Assessment" back>
      {s && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={s.name} uri={s.photo} /><View><Text style={{ fontWeight: '600', color: C.text }}>{s.name}</Text><Muted>{s.id} · {s.level}</Muted></View>
        </Card>
      )}
      <Field label="Date (YYYY-MM-DD)" value={f.date} onChangeText={set('date')} autoCapitalize="none" />
      <Field label="Overall Score (0–100)" value={f.score} onChangeText={set('score')} keyboardType="number-pad" placeholder="e.g. 85" />
      <SectionTitle>Skills (optional, 0–100)</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {SKILLS.map(([k, label]) => (
          <View key={k} style={{ width: '47%' }}><Field label={label} value={f[k] ?? ''} onChangeText={set(k)} keyboardType="number-pad" placeholder="—" /></View>
        ))}
      </View>
      <Field label="Coach comment (optional)" value={f.comments} onChangeText={set('comments')} multiline placeholder="Strengths, what to work on…" style={{ minHeight: 90, textAlignVertical: 'top' }} />
      {!!error && <Text style={{ color: C.danger, fontSize: 13 }}>{error}</Text>}
      <Btn label={busy ? 'Saving…' : 'Save Assessment'} disabled={busy} onPress={submit} />
    </Screen>
  );
}
