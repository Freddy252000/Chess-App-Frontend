import React, { useState } from 'react';
import { View, Text, Share, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as api from '../../api';
import { useApi } from '../../hooks/useApi';
import { Screen, Card, Avatar, Badge, ProgressBar, Btn, Muted, SectionTitle, Segmented, Async, Icon } from '../../components/ui';
import { BarChart, DonutChart, LineChart, MonthLabels } from '../../components/charts';
import { monthKey, monthTitle, shiftMonth, signed } from '../../utils/format';
import { ReportSummary } from '../../data/types';
import { C, display } from '../../theme';

type Tab = 'attendance' | 'performance' | 'monthly';

export const MonthSwitch = ({ month, onChange }: { month: string; onChange: (m: string) => void }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 6 }}>
    <TouchableOpacity onPress={() => onChange(shiftMonth(month, -1))} style={{ padding: 8 }}><Icon name="chevron-back" size={20} /></TouchableOpacity>
    <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{monthTitle(month)}</Text>
    <TouchableOpacity disabled={month >= monthKey()} onPress={() => onChange(shiftMonth(month, 1))} style={{ padding: 8, opacity: month >= monthKey() ? 0.3 : 1 }}><Icon name="chevron-forward" size={20} /></TouchableOpacity>
  </View>
);

const reportText = (r: ReportSummary) =>
  `Chess Academy – Monthly Report (${monthTitle(r.month)})\n\n` +
  `Total classes: ${r.monthly.totalClasses}\nStudents enrolled: ${r.monthly.enrolled}\nAvg attendance: ${r.monthly.avgAttendance}%\n` +
  `Avg performance: ${r.monthly.avgPerformance}%\nAssessments held: ${r.monthly.assessments}\nTop performer: ${r.monthly.topPerformer}`;

/** Admin tab, also pushed for staff */
export default function Reports() {
  const nav = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('attendance');
  const [month, setMonth] = useState(monthKey());
  const isPushed = nav.getState?.().type === 'stack';
  const rep = useApi(() => api.getReportSummary(month), [month]);

  return (
    <Screen title="Reports" back={isPushed} onRefresh={rep.reload}>
      <MonthSwitch month={month} onChange={setMonth} />
      <Segmented<Tab> options={['attendance', 'performance', 'monthly']} value={tab} onChange={setTab} />
      <Async state={rep}>
        {r => (
          <>
            {tab === 'attendance' && (
              <>
                <Card style={{ gap: 12 }}>
                  <SectionTitle>Attendance Overview</SectionTitle>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(27,67,50,.1)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontFamily: display, fontWeight: '700', color: C.green }}>{r.attendance.avg}%</Text><Text style={{ fontSize: 12, color: C.text2 }}>Avg Attendance</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontFamily: display, fontWeight: '700', color: C.text }}>{r.attendance.avgPresentPerDay}</Text><Muted>Avg Present/Day</Muted>
                    </View>
                  </View>
                  <BarChart data={r.attendance.monthly.values} labels={r.attendance.monthly.labels} />
                </Card>
                {r.attendance.perStudent.map(s => (
                  <Card key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar name={s.name} size="sm" uri={s.photo} />
                    <View style={{ flex: 1, gap: 4 }}><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{s.name}</Text><ProgressBar value={s.percent} color={s.percent > 85 ? 'green' : s.percent > 70 ? 'warning' : 'danger'} /></View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.green }}>{s.percent}%</Text>
                  </Card>
                ))}
              </>
            )}

            {tab === 'performance' && (
              <Card style={{ gap: 16 }}>
                <SectionTitle>Performance Overview</SectionTitle>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <DonutChart value={r.performance.avg} color={C.mint} size={80} />
                  <View style={{ gap: 4 }}><Muted>Academy Average</Muted><Text style={{ fontSize: 24, fontWeight: '700', color: C.text }}>{r.performance.avg}%</Text>
                    <Badge label={`${signed(r.performance.delta)}% vs last month`} type={r.performance.delta >= 0 ? 'success' : 'danger'} /></View>
                </View>
                <LineChart data={r.performance.trend.values} color={C.mint} /><MonthLabels labels={r.performance.trend.labels} />
              </Card>
            )}

            {tab === 'monthly' && (
              <Card>
                <SectionTitle>Monthly Summary — {monthTitle(r.month)}</SectionTitle>
                {([['Total Classes', r.monthly.totalClasses], ['Students Enrolled', r.monthly.enrolled], ['Avg Attendance', `${r.monthly.avgAttendance}%`],
                  ['Avg Performance', `${r.monthly.avgPerformance}%`], ['Assessments Held', r.monthly.assessments], ['Top Performer', r.monthly.topPerformer]] as const).map(([k, v], i) => (
                  <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
                    <Text style={{ fontSize: 14, color: C.muted }}>{k}</Text><Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{v}</Text>
                  </View>
                ))}
                <Btn variant="ghost" icon="share-outline" label="Share Report" style={{ marginTop: 12 }} onPress={() => Share.share({ message: reportText(r) })} />
              </Card>
            )}
          </>
        )}
      </Async>
    </Screen>
  );
}
