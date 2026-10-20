export type RootStackParamList = {
  Login: undefined;
  AdminTabs: undefined; StaffTabs: undefined; StudentTabs: undefined;
  AddStudent: { id?: string } | undefined; StudentDetail: { id: string };
  StaffList: undefined; AddStaff: { id?: string } | undefined; StaffDetail: { id: string };
  AdminAttendance: undefined; AdminPerformance: undefined; Reports: undefined; PasswordMgmt: undefined;
  CreateMatch: { id?: string } | undefined; MatchDetail: { id: string };
  StaffPerfDetail: { id: string }; StaffStudentAttendance: { id: string };
  AddAssessment: { studentId: string }; ChangePassword: undefined;
  StudentProfile: undefined; StudentReports: undefined;
};
