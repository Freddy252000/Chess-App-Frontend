/**
 * API client for the Chess Academy server (see /server).
 * Screens never call fetch directly – they use these functions (via context/Data, context/Auth or the useApi hook).
 */
import { API_ORIGIN, API_URL } from '../config';
import {
  AdminDashboard, AssessmentInput, AttendanceSummary, AuthUser, DayAttendance, Match, MatchInput, MatchResult,
  PerformanceDetail, ReportSummary, StaffDashboard, StaffInput, StaffMember, Student, StudentInput, StudentReport,
} from '../data/types';
import { fmtDate, fmtTime } from '../utils/format';

/* ───────── low level ───────── */
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;
export const setAuthToken = (t: string | null) => { token = t; };
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

type Opts = { method?: string; body?: unknown; form?: FormData };

async function request<T>(path: string, { method = 'GET', body, form }: Opts = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method, headers, signal: controller.signal,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch (e: any) {
    throw new ApiError(e?.name === 'AbortError' ? 'The server took too long to respond' : `Cannot reach the server (${API_ORIGIN}). Is it running?`, 0);
  } finally {
    clearTimeout(timer);
  }

  let data: any = null;
  if (res.status !== 204) { try { data = await res.json(); } catch { /* empty body */ } }
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.(); // expired / deleted account → sign out
    throw new ApiError(data?.message ?? `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

/* ───────── photos ───────── */
const absUrl = (p?: string | null) => (!p ? undefined : p.startsWith('/') ? API_ORIGIN + p : p);
const relUrl = (p: string) => (p.startsWith(API_ORIGIN) ? p.slice(API_ORIGIN.length) : p);

/** local file (from camera/gallery) → uploaded to the server; already-hosted urls are kept as they are */
export async function resolvePhoto(uri?: string | null): Promise<string | null> {
  if (!uri) return null;
  if (/^https?:\/\//.test(uri)) return relUrl(uri);
  const ext = (uri.split('?')[0].split('.').pop() ?? 'jpg').toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const form = new FormData();
  form.append('photo', { uri, name: `photo.${ext === 'png' || ext === 'webp' ? ext : 'jpg'}`, type } as any);
  return (await request<{ url: string }>('/uploads/photo', { method: 'POST', form })).url;
}

/* ───────── mappers (server → app models) ───────── */
const mapStudent = (s: any): Student => ({ ...s, photo: absUrl(s.photo) });
const mapStaff = (s: any): StaffMember => ({
  email: '', phone: '', joined: '', address: '', students: 0, ...s, photo: absUrl(s.photo),
});
const mapMatch = (m: any): Match => ({
  id: m.id, name: m.name, type: m.type, venue: m.venue, status: m.status,
  isoDate: m.date, date: fmtDate(m.date), start: m.startTime ?? '', end: m.endTime ?? '',
  time: fmtTime(m.startTime ?? ''), endTime: fmtTime(m.endTime ?? ''),
  studentIds: m.studentIds, staffIds: m.staffIds, results: m.results,
});
const withPhoto = async <T extends { photo?: string | null }>(input: T): Promise<T> => {
  if (!('photo' in input)) return input;
  return { ...input, photo: await resolvePhoto(input.photo) } as T;
};

/* ───────── auth ───────── */
export const login = async (username: string, password: string): Promise<AuthUser> => {
  const r = await request<{ token: string; user: Omit<AuthUser, 'token'> }>('/auth/login', { method: 'POST', body: { username, password } });
  return { ...r.user, token: r.token };
};
export const changeMyPassword = (currentPassword: string, newPassword: string) =>
  request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
export const resetPassword = (refId: string, password: string) =>
  request(`/users/${refId}/password`, { method: 'POST', body: { password } });

/* ───────── students ───────── */
export const getStudents = async () => (await request<any[]>('/students')).map(mapStudent);
export const addStudent = async (input: StudentInput) =>
  mapStudent(await request('/students', { method: 'POST', body: await withPhoto(input) }));
export const updateStudent = async (id: string, patch: Partial<StudentInput>) =>
  mapStudent(await request(`/students/${id}`, { method: 'PUT', body: await withPhoto(patch) }));
export const deleteStudent = (id: string) => request<void>(`/students/${id}`, { method: 'DELETE' });
export const getStudentAttendance = (id: string) => request<AttendanceSummary>(`/students/${id}/attendance`);
export const getStudentPerformance = (id: string) => request<PerformanceDetail>(`/students/${id}/performance`);
export const addAssessment = (id: string, input: AssessmentInput) =>
  request(`/students/${id}/assessments`, { method: 'POST', body: input });

/* ───────── staff ───────── */
export const getStaff = async () => (await request<any[]>('/staff')).map(mapStaff);
export const addStaff = async (input: StaffInput) =>
  mapStaff(await request('/staff', { method: 'POST', body: await withPhoto(input) }));
export const updateStaff = async (id: string, patch: Partial<StaffInput>) =>
  mapStaff(await request(`/staff/${id}`, { method: 'PUT', body: await withPhoto(patch) }));
export const deleteStaff = (id: string) => request<void>(`/staff/${id}`, { method: 'DELETE' });

/* ───────── attendance ───────── */
export const getDayAttendance = async (date: string, batch: string): Promise<DayAttendance> => {
  const d = await request<DayAttendance>(`/attendance?date=${encodeURIComponent(date)}&batch=${encodeURIComponent(batch)}`);
  return { ...d, students: d.students.map(s => ({ ...s, photo: absUrl(s.photo) })) };
};
export const saveAttendance = (date: string, batch: string, records: { studentId: string; present: boolean }[]) =>
  request('/attendance', { method: 'PUT', body: { date, batch, records } });

/* ───────── matches ───────── */
export const getMatches = async () => (await request<any[]>('/matches')).map(mapMatch);
export const createMatch = async (input: MatchInput) => mapMatch(await request('/matches', { method: 'POST', body: input }));
export const updateMatch = async (id: string, input: MatchInput) => mapMatch(await request(`/matches/${id}`, { method: 'PUT', body: input }));
export const cancelMatch = (id: string) => request<void>(`/matches/${id}`, { method: 'DELETE' });
export const saveResult = async (matchId: string, studentId: string, r: MatchResult) =>
  mapMatch(await request(`/matches/${matchId}/results/${studentId}`, { method: 'PUT', body: r }));

/* ───────── dashboards & reports ───────── */
export const getAdminDashboard = async () => {
  const d = await request<AdminDashboard>('/dashboard');
  return d;
};
export const getStaffDashboard = async () => {
  const d = await request<StaffDashboard>('/dashboard');
  return { ...d, students: d.students.map(s => ({ ...s, photo: absUrl(s.photo) })) };
};
export const getReportSummary = (month?: string) =>
  request<ReportSummary>(`/reports/summary${month ? `?month=${month}` : ''}`);
export const getStudentReport = (id: string, month?: string) =>
  request<StudentReport>(`/reports/student/${id}${month ? `?month=${month}` : ''}`);
