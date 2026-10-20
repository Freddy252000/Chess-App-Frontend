import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as api from '../api';
import { useApi } from '../hooks/useApi';
import { Async, Badge, Btn, Card, Muted, ProgressBar, SectionTitle } from './ui';
import { BarChart, DonutChart, LineChart, MonthLabels } from './charts';
import { SkillKey } from '../data/types';
import { fmtDate, signed } from '../utils/format';
import { C } from '../theme';

/** Attendance summary, monthly chart and recent days for one student (used by admin, staff and the student) */
export function AttendancePanel({ studentId }: { studentId: string }) {
  const state = useApi(() => api.getStudentAttendance(studentId), [studentId]);
  return (
    <Async state={state}>
      {a => (
        <>
          <Card style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionTitle>Attendance Summary</SectionTitle>
              <DonutChart value={a.percent} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {([['Total Classes', a.total, C.bg, C.text], ['Present', a.present, '#F0FDF4', '#15803D'], ['Absent', a.absent, '#FEF2F2', C.danger]] as const).map(([k, v, bg, fg]) => (
                <View key={k} style={{ flex: 1, backgroundColor: bg, borderRadius: 12, padding: 10, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: fg }}>{v}</Text>
                  <Muted style={{ fontSize: 10 }}>{k}</Muted>
                </View>
              ))}
            </View>
          </Card>
          <Card style={{ gap: 12 }}>
            <SectionTitle>Monthly Attendance</SectionTitle>
            <BarChart data={a.monthly.values} labels={a.monthly.labels} />
          </Card>
          <Card>
            <SectionTitle>Recent History</SectionTitle>
            {!a.recent.length && <Muted style={{ marginTop: 8 }}>No attendance recorded yet.</Muted>}
            {a.recent.map((r, i) => (
              <View key={r.date} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
                <Text style={{ fontSize: 14, color: C.text2 }}>{fmtDate(r.date)}</Text>
                <Badge label={r.present ? 'Present' : 'Absent'} type={r.present ? 'success' : 'danger'} />
              </View>
            ))}
          </Card>
        </>
      )}
    </Async>
  );
}

const SKILLS: [SkillKey, string][] = [
  ['tactics', 'Tactical Skills'], ['openings', 'Opening Theory'], ['endgame', 'Endgame Play'], ['analysis', 'Game Analysis'], ['tournament', 'Tournament Play'],
];

/** Score, skills, history, assessments and coach comments for one student. `canAdd` shows the "Add Assessment" button. */
export function PerformancePanel({ studentId, canAdd }: { studentId: string; canAdd?: boolean }) {
  const nav = useNavigation<any>();
  const state = useApi(() => api.getStudentPerformance(studentId), [studentId]);
  return (
    <Async state={state}>
      {p => (
        <>
          <Card style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 4 }}>
                <SectionTitle>Overall Performance</SectionTitle>
                {p.previous !== null && <Badge label={`${signed(p.improvement)}% since last assessment`} type={p.improvement >= 0 ? 'success' : 'danger'} />}
              </View>
              <DonutChart value={p.current} color={C.mint} />
            </View>
            {SKILLS.map(([k, label]) => (
              <View key={k} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: C.text2 }}>{label}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.green }}>{p.skills[k]}%</Text>
                </View>
                <ProgressBar value={p.skills[k]} color="mint" />
              </View>
            ))}
          </Card>

          {canAdd && <Btn icon="add-circle-outline" label="Add Assessment" onPress={() => nav.navigate('AddAssessment', { studentId })} />}

          <Card style={{ gap: 12 }}>
            <SectionTitle>Performance History</SectionTitle>
            <LineChart data={p.history.map(h => h.score)} color={C.mint} />
            <MonthLabels labels={p.history.map(h => fmtDate(h.date).split(' ')[1])} />
          </Card>

          <Card>
            <SectionTitle>Assessments</SectionTitle>
            {!p.assessments.length && <Muted style={{ marginTop: 8 }}>No assessments yet.</Muted>}
            {p.assessments.map((a, i) => {
              const prev = p.assessments[i + 1];
              return (
                <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
                  <View><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{fmtDate(a.date)}</Text><Muted>{a.level}</Muted></View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.green }}>{a.score}%</Text>
                    {prev && <Text style={{ fontSize: 10, color: a.score >= prev.score ? '#16A34A' : C.danger }}>{signed(a.score - prev.score)}%</Text>}
                  </View>
                </View>
              );
            })}
          </Card>

          {!!p.comments.length && (
            <Card style={{ gap: 10, backgroundColor: 'rgba(240,217,181,.4)' }}>
              <SectionTitle>Coach Comments</SectionTitle>
              {p.comments.map(c => (
                <View key={c.id} style={{ gap: 4 }}>
                  <Text style={{ fontSize: 14, color: C.text2, fontStyle: 'italic', lineHeight: 21 }}>"{c.text}"</Text>
                  <Muted>— {c.coach} · {fmtDate(c.date)}</Muted>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </Async>
  );
}
