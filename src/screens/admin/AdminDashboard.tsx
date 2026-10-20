import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as api from '../../api';
import { useApi } from '../../hooks/useApi';
import { HeroScreen, StatCard, QuickAction, SectionTitle, Card, Badge, Muted, Async } from '../../components/ui';
import { LineChart, MonthLabels } from '../../components/charts';
import { fmtDate, signed, timeAgo } from '../../utils/format';
import { C } from '../../theme';

const DOT = { success: C.ok, primary: C.green, default: '#D1D5DB' };

export default function AdminDashboard() {
  const nav = useNavigation<any>();
  const dash = useApi(api.getAdminDashboard);
  return (
    <HeroScreen greeting="Good Morning," title="Admin" sub="Manage your Chess Academy efficiently" onRefresh={dash.reload}>
      <Async state={dash}>
        {d => (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <StatCard label="Total Students" value={d.students.total} sub={`${d.students.active} active`} />
              <StatCard label="Total Staff" value={d.staff.total} sub={`${d.staff.active} active`} />
              <StatCard label="Latest Attendance" value={d.attendance ? `${d.attendance.percent}%` : '—'}
                sub={d.attendance ? `${d.attendance.present} of ${d.attendance.total} · ${fmtDate(d.attendance.date)}` : 'No records yet'} />
              <StatCard label="Avg Performance" value={`${d.performance.avg}%`} sub={`${signed(d.performance.delta)}% vs last month`} />
            </View>

            <QuickActions nav={nav} />

            <View style={{ gap: 12 }}>
              <SectionTitle>Recent Activity</SectionTitle>
              <Card style={{ padding: 0 }}>
                {!d.activity.length && <Muted style={{ padding: 14 }}>Nothing yet.</Muted>}
                {d.activity.map((a, i) => (
                  <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: C.bg }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: DOT[a.type] }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, color: C.text }}>{a.text}</Text>
                      <Muted>{timeAgo(a.time)}</Muted>
                    </View>
                  </View>
                ))}
              </Card>
            </View>

            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>Performance Trend</Text>
                <Badge label="Last 12 months" type="primary" />
              </View>
              <LineChart data={d.trend.values} />
              <MonthLabels labels={d.trend.labels} />
            </Card>
          </>
        )}
      </Async>
      {/* quick actions are useful even if the stats fail to load */}
      {!dash.data && <QuickActions nav={nav} />}
    </HeroScreen>
  );
}

function QuickActions({ nav }: { nav: any }) {
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle>Quick Actions</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <QuickAction label="Add Student" icon="add" bg="rgba(27,67,50,.1)" color={C.green} onPress={() => nav.navigate('AddStudent')} />
        <QuickAction label="Staff" icon="people-outline" bg="#EFF6FF" color="#1D4ED8" onPress={() => nav.navigate('StaffList')} />
        <QuickAction label="Attendance" icon="calendar-outline" bg="#FFFBEB" color="#B45309" onPress={() => nav.navigate('AdminAttendance')} />
        <QuickAction label="Matches" icon="trophy-outline" bg="rgba(181,136,99,.2)" color={C.brown} onPress={() => nav.navigate('Matches')} />
        <QuickAction label="Performance" icon="pulse-outline" bg="#FDF2F8" color="#BE185D" onPress={() => nav.navigate('AdminPerformance')} />
        <QuickAction label="Reports" icon="document-text-outline" bg="#F0FDFA" color="#0F766E" onPress={() => nav.navigate('Reports')} />
      </View>
    </View>
  );
}
