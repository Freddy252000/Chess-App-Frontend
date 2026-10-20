import React, { useState } from 'react';
import { View, Text, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import * as api from '../../api';
import { useApi } from '../../hooks/useApi';
import { HeroScreen, Screen, Card, Badge, Btn, Muted, SectionTitle, InfoCard, QuickAction, Empty, Icon, Avatar, Async } from '../../components/ui';
import { DonutChart, LineChart } from '../../components/charts';
import { ChessPawn } from '../../components/ChessPieces';
import { AttendancePanel, PerformancePanel } from '../../components/StudentPanels';
import { MonthSwitch } from '../shared/Reports';
import { TypePill, ResultGrid } from '../shared/Matches';
import { useData, useMyStudent } from '../../context/Data';
import { useAuth } from '../../context/Auth';
import { fmtDate, monthKey, monthTitle, signed } from '../../utils/format';
import { C, display } from '../../theme';

export function StudentDashboard() {
  const nav = useNavigation<any>();
  const me = useMyStudent();
  const { user } = useAuth();
  const { refresh } = useData();
  const perf = useApi(() => api.getStudentPerformance(user!.refId), [user?.refId]);
  return (
    <HeroScreen greeting="Welcome," title={user?.name ?? ''} sub={me.level ? `${me.level} · ${me.batch}` : undefined} onRefresh={async () => { await Promise.all([refresh(), perf.reload()]); }}>
      <View style={{ backgroundColor: 'rgba(240,217,181,.5)', borderColor: 'rgba(181,136,99,.3)', borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <ChessPawn size={24} color={C.brown} />
        <Text style={{ fontSize: 12, color: C.text2, fontStyle: 'italic', fontFamily: display }}>"Keep learning. Keep playing. Keep improving."</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Card style={{ width: '47.5%', gap: 8 }}><Muted>Attendance</Muted><DonutChart value={me.attendance} size={64} /></Card>
        <Card style={{ width: '47.5%', gap: 8 }}><Muted>Performance</Muted><DonutChart value={me.performance} size={64} color={C.mint} /></Card>
        <Card style={{ width: '47.5%' }}><Muted>Chess Level</Muted><Text style={{ fontSize: 18, fontWeight: '700', color: C.green, fontFamily: display, marginTop: 4 }}>{me.level || '—'}</Text></Card>
        <Card style={{ width: '47.5%' }}><Muted>Current Class</Muted><Text style={{ fontSize: 18, fontWeight: '700', color: C.green, fontFamily: display, marginTop: 4 }}>{me.batch || '—'}</Text></Card>
      </View>
      <View style={{ gap: 12 }}>
        <SectionTitle>Quick Navigation</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <QuickAction row label="My Attendance" icon="calendar-outline" bg="rgba(27,67,50,.1)" color={C.green} onPress={() => nav.navigate('Attendance')} />
          <QuickAction row label="My Matches" icon="trophy-outline" bg="rgba(181,136,99,.2)" color={C.brown} onPress={() => nav.navigate('Matches')} />
          <QuickAction row label="My Performance" icon="pulse-outline" bg="#F0FDFA" color="#0F766E" onPress={() => nav.navigate('Performance')} />
          <QuickAction row label="My Profile" icon="person-outline" bg="#FAF5FF" color="#7E22CE" onPress={() => nav.navigate('StudentProfile')} />
          <QuickAction row label="My Reports" icon="document-text-outline" bg="#F0FDFA" color="#0F766E" onPress={() => nav.navigate('StudentReports')} />
          <QuickAction row label="Settings" icon="settings-outline" bg="#F3F4F6" color="#4B5563" onPress={() => nav.navigate('Settings')} />
        </View>
      </View>
      <Card style={{ gap: 12 }}>
        <SectionTitle>Performance Trend</SectionTitle>
        <Async state={perf}>{p => <LineChart data={p.history.map(h => h.score)} color={C.mint} />}</Async>
      </Card>
    </HeroScreen>
  );
}

export function StudentAttendance() {
  const { user } = useAuth();
  return <Screen title="My Attendance"><AttendancePanel studentId={user!.refId} /></Screen>;
}

export function StudentPerformance() {
  const { user } = useAuth();
  return <Screen title="My Performance"><PerformancePanel studentId={user!.refId} /></Screen>;
}

export function StudentReports() {
  const { user } = useAuth();
  const [month, setMonth] = useState(monthKey());
  const rep = useApi(() => api.getStudentReport(user!.refId, month), [month]);
  const Rows = ({ rows }: { rows: [string, string][] }) => <>{rows.map(([k, v], i) => (
    <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
      <Text style={{ fontSize: 14, color: C.muted }}>{k}</Text><Text style={{ fontSize: 14, fontWeight: '600', color: k === 'Improvement' ? '#16A34A' : C.text }}>{v}</Text>
    </View>))}</>;
  return (
    <Screen title="My Reports" back onRefresh={rep.reload}>
      <MonthSwitch month={month} onChange={setMonth} />
      <Async state={rep}>
        {r => (
          <>
            <Card><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><SectionTitle>Monthly Report</SectionTitle><Badge label={monthTitle(r.month)} /></View>
              <Rows rows={[['Total Classes', `${r.totalClasses}`], ['Present', `${r.present}`], ['Absent', `${r.absent}`], ['Attendance %', `${r.percent}%`]]} /></Card>
            <Card><SectionTitle>Performance Report</SectionTitle>
              <Rows rows={[['Overall Score', `${r.performance.score}%`], ['Previous Score', r.performance.previous === null ? '—' : `${r.performance.previous}%`], ['Improvement', `${signed(r.performance.improvement)}%`], ['Chess Level', r.performance.level]]} /></Card>
            <Card>
              <SectionTitle>Assessment History</SectionTitle>
              {!r.history.length && <Muted style={{ marginTop: 8 }}>No assessments yet.</Muted>}
              {r.history.map((a, i) => (
                <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
                  <View><Text style={{ fontSize: 14, fontWeight: '500', color: C.text }}>{fmtDate(a.date)}</Text><Muted>{a.level}</Muted></View>
                  <View style={{ alignItems: 'flex-end' }}><Text style={{ fontSize: 14, fontWeight: '700', color: C.green }}>{a.score}%</Text>
                    {a.delta !== null && <Text style={{ fontSize: 10, color: a.delta >= 0 ? '#16A34A' : C.danger }}>{signed(a.delta)}%</Text>}</View>
                </View>
              ))}
            </Card>
            <Btn variant="outline" icon="share-outline" label="Share Report" onPress={() => Share.share({ message:
              `${r.student.name} – ${monthTitle(r.month)}\nAttendance: ${r.present}/${r.totalClasses} (${r.percent}%)\nPerformance: ${r.performance.score}% (${signed(r.performance.improvement)}%)\nLevel: ${r.performance.level}` })} />
          </>
        )}
      </Async>
    </Screen>
  );
}

export function StudentProfile() {
  const me = useMyStudent();
  return (
    <Screen title="My Profile" back>
      <LinearGradient colors={[C.green, C.greenDark]} style={{ borderRadius: 16, padding: 20, alignItems: 'center', gap: 4 }}>
        <Avatar name={me.name} size="xl" uri={me.photo} />
        <Text style={{ color: '#fff', fontSize: 20, fontFamily: display, marginTop: 8 }}>{me.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>{me.id}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}><Badge label={me.level || '—'} /><Badge label={me.batch || '—'} /></View>
      </LinearGradient>
      <InfoCard title="Personal Information" rows={[['Full Name', me.name], ['Student ID', me.id], ['Age', `${me.age} years`], ['Gender', me.gender], ['Phone', me.phone || '—'], ['Email', me.email || '—']]} />
      <InfoCard title="Parent/Guardian" rows={[['Name', me.parent || '—'], ['Contact', me.parentPhone || '—']]} />
      <InfoCard title="Academy Info" rows={[['Chess Level', me.level], ['Batch', me.batch], ['Joined', me.joined], ['Address', me.address || '—']]} />
      <View style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Icon name="information-circle-outline" color="#D97706" />
        <Text style={{ flex: 1, fontSize: 12, color: '#B45309' }}>Profile information can only be changed by your instructor or admin.</Text>
      </View>
    </Screen>
  );
}

export function StudentMatches() {
  const me = useMyStudent();
  const { matches, staff, refresh } = useData();
  const mine = matches.filter(m => m.studentIds.includes(me.id));
  const upcoming = mine.filter(m => m.status !== 'Completed'), done = mine.filter(m => m.status === 'Completed');
  return (
    <Screen title="My Matches" onRefresh={refresh}>
      {!!upcoming.length && <SectionTitle>Upcoming</SectionTitle>}
      {upcoming.map(m => (
        <Card key={m.id} style={{ padding: 0, overflow: 'hidden' }}>
          <LinearGradient colors={[C.green, C.greenDark]} style={{ padding: 14, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontFamily: display, flex: 1 }}>{m.name}</Text><Badge label={m.status} type="info" />
            </View>
            <TypePill type={m.type} />
          </LinearGradient>
          <View style={{ padding: 14, gap: 6 }}>
            <Text style={{ fontSize: 14, color: C.text2 }}>📅 {m.date}</Text>
            <Text style={{ fontSize: 14, color: C.text2 }}>🕐 {m.time}{m.endTime !== 'TBD' ? ` – ${m.endTime}` : ''}</Text>
            <Text style={{ fontSize: 14, color: C.text2 }}>📍 {m.venue || 'Venue TBD'}</Text>
            {!!m.staffIds.length && <Muted>Assigned staff: {m.staffIds.map(id => staff.find(s => s.id === id)?.name.split(' ')[0] ?? id).join(', ')}</Muted>}
          </View>
        </Card>
      ))}
      {!!done.length && <SectionTitle>Completed</SectionTitle>}
      {done.map(m => {
        const r = m.results?.[me.id];
        return (
          <Card key={m.id} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 4, flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{m.name}</Text><TypePill type={m.type} /></View><Badge label="Completed" />
            </View>
            <Muted>📅 {m.date} · 📍 {m.venue || 'Venue TBD'}</Muted>
            {r ? (
              <>
                <View style={{ backgroundColor: 'rgba(240,217,181,.4)', borderColor: 'rgba(181,136,99,.3)', borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.text2 }}>My Result</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <LinearGradient colors={[C.green, C.greenLight]} style={{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{r.rank}</Text></LinearGradient>
                    <View><Text style={{ fontSize: 18, fontWeight: '700', color: C.green, fontFamily: display }}>{r.points}</Text><Muted>points earned</Muted></View>
                  </View>
                </View>
                <ResultGrid res={r} />
              </>
            ) : <Muted style={{ fontStyle: 'italic' }}>Results not yet recorded.</Muted>}
          </Card>
        );
      })}
      {!mine.length && <Empty icon="trophy-outline" title="No matches assigned yet" sub="Your coach will assign you to upcoming matches." />}
    </Screen>
  );
}
