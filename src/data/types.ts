export type Role = 'admin' | 'staff' | 'student';
export type MatchStatus = 'Upcoming' | 'Ongoing' | 'Completed';
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface AuthUser { refId: string; username: string; name: string; role: Role; token: string }

export interface Student {
  id: string; name: string; age: number; dob?: string; level: string; batch: string; phone: string; parent: string;
  parentPhone: string; email: string; attendance: number; performance: number; status: string;
  gender: string; joined: string; address: string; photo?: string; username?: string;
}
export interface StaffMember {
  id: string; name: string; email: string; phone: string; batch: string; status: string;
  joined: string; address: string; students: number; photo?: string; username?: string;
}
export type StudentInput = Partial<Omit<Student, 'id' | 'age' | 'attendance' | 'performance'>> & { name: string; password?: string };
export type StaffInput = Partial<Omit<StaffMember, 'id' | 'students'>> & { name: string; password?: string };

export interface MatchResult { played: number; wins: number; draws: number; losses: number; points: string; rank: string }
export interface Match {
  id: string; name: string; type: string; venue: string; status: MatchStatus;
  isoDate: string; date: string; start: string; end: string; time: string; endTime: string;
  studentIds: string[]; staffIds: string[]; results?: Record<string, MatchResult>;
}
export interface MatchInput {
  name: string; type: string; venue?: string; date: string; startTime?: string; endTime?: string;
  studentIds: string[]; staffIds: string[];
}

/* ── server read models ── */
export interface Series { labels: string[]; values: number[] }
export interface AttendanceDay { date: string; present: number; total: number; percent: number }
export interface Activity { id: number; text: string; type: 'success' | 'primary' | 'default'; time: string }
export interface AdminDashboard {
  students: { total: number; active: number }; staff: { total: number; active: number };
  attendance: AttendanceDay | null; performance: { avg: number; delta: number }; trend: Series; activity: Activity[];
}
export interface StaffDashboard {
  batch: string; myStudents: number; attendance: AttendanceDay | null; monthRate: number;
  performance: { avg: number; delta: number };
  students: { id: string; name: string; photo?: string; level: string; performance: number }[];
}
export interface AttendanceSummary {
  total: number; present: number; absent: number; percent: number; monthly: Series;
  recent: { date: string; present: boolean }[];
}
export type SkillKey = 'tactics' | 'openings' | 'endgame' | 'analysis' | 'tournament';
export interface PerformanceDetail {
  current: number; previous: number | null; improvement: number; skills: Record<SkillKey, number>;
  history: { date: string; score: number }[];
  assessments: { id: number; date: string; score: number; level: string }[];
  comments: { id: number; text: string; coach: string; date: string }[];
}
export interface AssessmentInput {
  date?: string; score: number; tactics?: number; openings?: number; endgame?: number; analysis?: number; tournament?: number; comments?: string;
}
export interface DayAttendance {
  date: string; batch: string; marked: boolean;
  students: { id: string; name: string; photo?: string; present: boolean | null }[];
}
export interface ReportSummary {
  month: string;
  attendance: { avg: number; avgPresentPerDay: number; monthly: Series; perStudent: { id: string; name: string; photo?: string; percent: number }[] };
  performance: { avg: number; delta: number; trend: Series };
  monthly: { totalClasses: number; enrolled: number; avgAttendance: number; avgPerformance: number; assessments: number; topPerformer: string };
}
export interface StudentReport {
  month: string; student: { id: string; name: string; level: string };
  totalClasses: number; present: number; absent: number; percent: number;
  performance: { score: number; previous: number | null; improvement: number; level: string };
  history: { id: number; date: string; score: number; level: string; delta: number | null }[];
}
