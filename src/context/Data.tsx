import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import * as api from '../api';
import { Match, MatchInput, MatchResult, StaffInput, StaffMember, Student, StudentInput } from '../data/types';
import { useAuth } from './Auth';

type Ctx = {
  students: Student[]; staff: StaffMember[]; matches: Match[]; loading: boolean; error: string;
  refresh: () => Promise<void>;
  addStudent: (i: StudentInput) => Promise<void>;
  updateStudent: (id: string, p: Partial<StudentInput>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addStaff: (i: StaffInput) => Promise<void>;
  updateStaff: (id: string, p: Partial<StaffInput>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  createMatch: (i: MatchInput) => Promise<void>;
  updateMatch: (id: string, i: MatchInput) => Promise<void>;
  cancelMatch: (id: string) => Promise<void>;
  saveResult: (matchId: string, studentId: string, r: MatchResult) => Promise<void>;
};
const DataCtx = createContext<Ctx>(null as unknown as Ctx);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [s, f, m] = await Promise.all([api.getStudents(), api.getStaff(), api.getMatches()]);
      setStudents(s); setStaff(f); setMatches(m); setError('');
    } catch (e: any) {
      setError(e?.message ?? 'Could not load data');
    }
  }, []);

  useEffect(() => {
    if (!user) { setStudents([]); setStaff([]); setMatches([]); setError(''); return; }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user, refresh]);

  /** run a mutation, then reload so every list shows the server's truth */
  const act = <A extends unknown[]>(fn: (...a: A) => Promise<unknown>) => async (...a: A) => { await fn(...a); await refresh(); };

  const value: Ctx = {
    students, staff, matches, loading, error, refresh,
    addStudent: act(api.addStudent), updateStudent: act(api.updateStudent), deleteStudent: act(api.deleteStudent),
    addStaff: act(api.addStaff), updateStaff: act(api.updateStaff), deleteStaff: act(api.deleteStaff),
    createMatch: act(api.createMatch), updateMatch: act(api.updateMatch), cancelMatch: act(api.cancelMatch),
    saveResult: act(api.saveResult),
  };
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
};

export const useData = () => useContext(DataCtx);

const EMPTY_STUDENT: Student = {
  id: '', name: '', age: 0, level: '', batch: '', phone: '', parent: '', parentPhone: '', email: '',
  attendance: 0, performance: 0, status: 'Active', gender: '', joined: '', address: '',
};
/** the logged-in student's own record (a blank placeholder until it has loaded) */
export function useMyStudent(): Student {
  const { user } = useAuth();
  const { students } = useData();
  return students.find(s => s.id === user?.refId) ?? EMPTY_STUDENT;
}
/** the logged-in staff member's own record */
export function useMyStaff(): StaffMember | undefined {
  const { user } = useAuth();
  const { staff } = useData();
  return staff.find(s => s.id === user?.refId);
}
