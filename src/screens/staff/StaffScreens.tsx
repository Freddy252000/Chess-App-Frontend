import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as api from '../../api';
import { useApi } from '../../hooks/useApi';
import { HeroScreen, Screen, StatCard, QuickAction, SectionTitle, Card, Avatar, Badge, ProgressBar, Btn, Muted, Async, Empty } from '../../components/ui';
import { DonutChart } from '../../components/charts';
import { AttendancePanel, PerformancePanel } from '../../components/StudentPanels';
import { AttendanceView } from '../admin/Operations';
import { MatchCard } from '../shared/Matches';
import { useData, useMyStaff } from '../../context/Data';
import { useAuth } from '../../context/Auth';
import { batchesOf, fmtDate, signed } from '../../utils/format';
import { C } from '../../theme';

export function StaffDashboard() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const dash = useApi(api.getStaffDashboard);
  return (
    <HeroScreen greeting="Good Morning," title={user?.name ?? 'Staff'} sub={`Chess Instructor${dash.data?.batch ? ` · ${dash.data.batch}` : ''}`} onRefresh={dash.reload}>
      <Async state={dash}>
        {d => (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <StatCard label="My Students" value={d.myStudents} sub={d.batch} />
              <StatCard label="Latest Attendance" value={d.attendance ? `${d.attendance.percent}%` : '—'} sub={d.attendance ? `${d.attendance.present} of ${d.attendance.total} · ${fmtDate(d.attendance.date)}` : 'No records yet'} />
              <StatCard label="Attendance Rate" value={`${d.monthRate}%`} sub="This month" />
              <StatCard label="Avg Performance" value={`${d.performance.avg}%`} sub={`${signed(d.performance.delta)}% vs last month`} />
            </View>
            <View style={{ gap: 12 }}>
              <SectionTitle>My Students</SectionTitle>
              {!d.students.length && <Empty icon="people-outline" title="No students in your batch yet" />}
              <Card style={{ padding: 0 }}>
                {d.students.map((s, i) => (
                  <TouchableOpacity key={s.id} onPress={() => nav.navigate('StaffPerfDetail', { id: s.id })}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
                    <Avatar name={s.name} size="sm" uri={s.photo} />
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{s.name}</Text><Muted>{s.level}</Muted></View>
                    <View style={{ alignItems: 'flex-end' }}><Text style={{ fontSize: 14, fontWeight: '700', color: C.green }}>{s.performance}%</Text><Muted style={{ fontSize: 10 }}>perf</Muted></View>
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          </>
        )}
      </Async>
      <View style={{ gap: 12 }}>
        <SectionTitle>Quick Actions</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <QuickAction row label="Mark Attendance" icon="calendar-outline" bg="rgba(27,67,50,.1)" color={C.green} onPress={() => nav.navigate('Attendance')} />
          <QuickAction row label="My Matches" icon="trophy-outline" bg="rgba(181,136,99,.2)" color={C.brown} onPress={() => nav.navigate('Matches')} />
          <QuickAction row label="Performance" icon="pulse-outline" bg="#EFF6FF" color="#1D4ED8" onPress={() => nav.navigate('Performance')} />
          <QuickAction row label="Reports" icon="document-text-outline" bg="#FAF5FF" color="#7E22CE" onPress={() => nav.navigate('Reports')} />
        </View>
      </View>
    </HeroScreen>
  );
}

export const StaffAttendance = () => <AttendanceView />;

export function StaffPerformance() {
  const nav = useNavigation<any>();
  const { students, refresh } = useData();
  const me = useMyStaff();
  const mine = batchesOf(me?.batch);
  const list = mine.length ? students.filter(s => mine.includes(s.batch)) : students;
  const scored = list.filter(s => s.performance > 0);
  const avg = scored.length ? Math.round(scored.reduce((n, s) => n + s.performance, 0) / scored.length) : 0;
  return (
    <Screen title="Performance" onRefresh={refresh}>
      <Card style={{ gap: 12 }}>
        <SectionTitle>Class Average</SectionTitle>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <DonutChart value={avg} color={C.mint} />
          <View style={{ gap: 4 }}><Text style={{ fontSize: 24, fontWeight: '700', color: C.text }}>{avg}%</Text><Muted>{me?.batch ?? 'All batches'} average</Muted></View>
        </View>
      </Card>
      {!list.length && <Empty icon="people-outline" title="No students yet" />}
      {list.map(s => (
        <Card key={s.id} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={s.name} size="sm" uri={s.photo} />
            <View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{s.name}</Text><Muted>{s.level} · {s.batch}</Muted></View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.green }}>{s.performance}%</Text>
          </View>
          <ProgressBar value={s.performance} color="mint" />
          <Btn small variant="soft" label="View Details" onPress={() => nav.navigate('StaffPerfDetail', { id: s.id })} />
        </Card>
      ))}
    </Screen>
  );
}

export function StaffPerfDetail() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { students } = useData();
  const s = students.find(x => x.id === params.id);
  return (
    <Screen title="Student Performance" back action={<Btn small variant="soft" icon="calendar-outline" label="Attendance" onPress={() => nav.navigate('StaffStudentAttendance', { id: params.id })} />}>
      {s && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={s.name} size="lg" uri={s.photo} />
          <View style={{ flex: 1 }}><Text style={{ fontWeight: '600', color: C.text, fontSize: 16 }}>{s.name}</Text><Muted>{s.level} · {s.batch}</Muted><Badge label={`Attendance ${s.attendance}%`} type="primary" /></View>
        </Card>
      )}
      <PerformancePanel studentId={params.id} canAdd />
    </Screen>
  );
}

export function StaffMatches() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const { matches, students, refresh } = useData();
  const mine = matches.filter(m => m.staffIds.includes(user?.refId ?? ''));
  const upcoming = mine.filter(m => m.status !== 'Completed').length;
  return (
    <Screen title="My Matches" onRefresh={refresh}>
      <View style={{ backgroundColor: 'rgba(27,67,50,.1)', borderRadius: 12, padding: 12 }}>
        <Text style={{ color: C.green, fontWeight: '500', fontSize: 14 }}>{upcoming} upcoming match{upcoming !== 1 ? 'es' : ''} assigned</Text>
      </View>
      {!mine.length && <Empty icon="trophy-outline" title="No matches assigned yet" />}
      {mine.map(m => (
        <View key={m.id} style={{ gap: 8 }}>
          <MatchCard m={m} onPress={() => nav.navigate('MatchDetail', { id: m.id })} />
          {m.results && (
            <Card style={{ gap: 8 }}>
              <SectionTitle>Results</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {m.studentIds.filter(id => m.results![id]).map(id => {
                  const s = students.find(x => x.id === id), r = m.results![id];
                  return <View key={id} style={{ backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' }}><Text style={{ fontSize: 10, fontWeight: '600', color: C.text }}>{(s?.name ?? id).split(' ')[0]}</Text><Text style={{ fontSize: 10, fontWeight: '700', color: C.green }}>{r.rank} · {r.points}</Text></View>;
                })}
              </View>
            </Card>
          )}
        </View>
      ))}
    </Screen>
  );
}

export function StaffStudentAttendance() {
  const { params } = useRoute<any>();
  const { students } = useData();
  const s = students.find(x => x.id === params.id);
  return (
    <Screen title="Student Attendance" back>
      {s && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={s.name} size="lg" uri={s.photo} />
          <View><Text style={{ fontWeight: '600', color: C.text, fontSize: 16 }}>{s.name}</Text><Muted>{s.level} · {s.batch}</Muted></View>
        </Card>
      )}
      <AttendancePanel studentId={params.id} />
    </Screen>
  );
}
