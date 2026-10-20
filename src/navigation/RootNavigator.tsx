import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/Auth';
import { C } from '../theme';
import { RootStackParamList } from './types';

import LoginScreen from '../screens/auth/LoginScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import { StudentManagement, AddStudent, StudentDetail } from '../screens/admin/Students';
import { StaffList, AddStaff, StaffDetail } from '../screens/admin/StaffScreens';
import { AdminAttendance, AdminPerformance, PasswordManagement } from '../screens/admin/Operations';
import { AdminMatches, CreateMatch, MatchDetail } from '../screens/shared/Matches';
import Reports from '../screens/shared/Reports';
import AddAssessment from '../screens/shared/AddAssessment';
import ChangePassword from '../screens/shared/ChangePassword';
import SettingsScreen from '../screens/shared/Settings';
import { StaffDashboard, StaffAttendance, StaffPerformance, StaffPerfDetail, StaffMatches, StaffStudentAttendance } from '../screens/staff/StaffScreens';
import { StudentDashboard, StudentAttendance, StudentPerformance, StudentReports, StudentProfile, StudentMatches } from '../screens/student/StudentScreens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Admin = createBottomTabNavigator();
const Staff = createBottomTabNavigator();
const Student = createBottomTabNavigator();

type IconPair = [React.ComponentProps<typeof Ionicons>['name'], React.ComponentProps<typeof Ionicons>['name']];
const ICONS: Record<string, IconPair> = {
  Home: ['home', 'home-outline'], Students: ['people', 'people-outline'], Matches: ['trophy', 'trophy-outline'],
  Reports: ['document-text', 'document-text-outline'], Settings: ['settings', 'settings-outline'],
  Attendance: ['calendar', 'calendar-outline'], Performance: ['pulse', 'pulse-outline'],
};

function useTabOptions() {
  const insets = useSafeAreaInsets();
  return ({ route }: any) => ({
    headerShown: false,
    tabBarActiveTintColor: C.green,
    tabBarInactiveTintColor: C.muted,
    tabBarLabelStyle: { fontSize: 10, fontWeight: '500' as const },
    tabBarStyle: { height: 56 + insets.bottom, paddingBottom: insets.bottom + 4, paddingTop: 6, borderTopColor: C.border },
    tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
      <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={22} color={color} />
    ),
  });
}

const AdminTabs = () => (
  <Admin.Navigator screenOptions={useTabOptions()}>
    <Admin.Screen name="Home" component={AdminDashboard} />
    <Admin.Screen name="Students" component={StudentManagement} />
    <Admin.Screen name="Matches" component={AdminMatches} />
    <Admin.Screen name="Reports" component={Reports} />
    <Admin.Screen name="Settings" component={SettingsScreen} />
  </Admin.Navigator>
);
const StaffTabs = () => (
  <Staff.Navigator screenOptions={useTabOptions()}>
    <Staff.Screen name="Home" component={StaffDashboard} />
    <Staff.Screen name="Attendance" component={StaffAttendance} />
    <Staff.Screen name="Matches" component={StaffMatches} />
    <Staff.Screen name="Performance" component={StaffPerformance} />
    <Staff.Screen name="Settings" component={SettingsScreen} />
  </Staff.Navigator>
);
const StudentTabs = () => (
  <Student.Navigator screenOptions={useTabOptions()}>
    <Student.Screen name="Home" component={StudentDashboard} />
    <Student.Screen name="Attendance" component={StudentAttendance} />
    <Student.Screen name="Matches" component={StudentMatches} />
    <Student.Screen name="Performance" component={StudentPerformance} />
    <Student.Screen name="Settings" component={SettingsScreen} />
  </Student.Navigator>
);

export default function RootNavigator() {
  const { role, ready } = useAuth();
  if (!ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}><ActivityIndicator size="large" color={C.green} /></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!role && <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />}

        {role === 'admin' && (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="AddStudent" component={AddStudent} />
            <Stack.Screen name="StudentDetail" component={StudentDetail} />
            <Stack.Screen name="StaffList" component={StaffList} />
            <Stack.Screen name="AddStaff" component={AddStaff} />
            <Stack.Screen name="StaffDetail" component={StaffDetail} />
            <Stack.Screen name="AdminAttendance" component={AdminAttendance} />
            <Stack.Screen name="AdminPerformance" component={AdminPerformance} />
            <Stack.Screen name="PasswordMgmt" component={PasswordManagement} />
            <Stack.Screen name="CreateMatch" component={CreateMatch} />
            <Stack.Screen name="AddAssessment" component={AddAssessment} />
          </>
        )}
        {role === 'staff' && (
          <>
            <Stack.Screen name="StaffTabs" component={StaffTabs} />
            <Stack.Screen name="StaffPerfDetail" component={StaffPerfDetail} />
            <Stack.Screen name="StaffDetail" component={StaffDetail} />
            <Stack.Screen name="StaffStudentAttendance" component={StaffStudentAttendance} />
            <Stack.Screen name="AddAssessment" component={AddAssessment} />
            <Stack.Screen name="Reports" component={Reports} />
          </>
        )}
        {role === 'student' && (
          <>
            <Stack.Screen name="StudentTabs" component={StudentTabs} />
            <Stack.Screen name="StudentProfile" component={StudentProfile} />
            <Stack.Screen name="StudentReports" component={StudentReports} />
          </>
        )}
        {role && <Stack.Screen name="MatchDetail" component={MatchDetail} />}
        {role && <Stack.Screen name="ChangePassword" component={ChangePassword} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
