export type Role = 'admin' | 'staff' | 'student';
export type MatchStatus = 'Upcoming' | 'Ongoing' | 'Completed';
export type MatchResult = { played: number; wins: number; draws: number; losses: number; points: string; rank: string };
export type Match = {
  id: string; name: string; type: string; date: string; dayNum: number; time: string; endTime: string;
  venue: string; status: MatchStatus; studentIds: string[]; staffIds: string[];
  results?: Record<string, MatchResult>;
};
export interface Student {
  id: string; name: string; age: number; level: string; batch: string; phone: string; parent: string;
  parentPhone: string; email: string; attendance: number; performance: number; status: string;
  gender: string; joined: string; address: string; photo?: string; username?: string;
}
export interface StaffMember {
  id: string; name: string; email: string; phone: string; batch: string; status: string;
  joined: string; address: string; students: number; photo?: string; username?: string;
}
export type StudentInput = Partial<Omit<Student, 'id' | 'age'>> & { name: string; dob?: string; password?: string };
export type StaffInput = Partial<Omit<StaffMember, 'id'>> & { name: string; password?: string };
export interface MatchInput {
  name: string; type: string; venue: string; date: string; time: string; endTime: string;
  studentIds: string[]; staffIds: string[];
}

export const STUDENTS: Student[] = [
  { id: 'STU001', username: 'arjun', name: 'Arjun Mehta', age: 14, level: 'Advanced', batch: 'Batch A', phone: '+91 98765 43210', parent: 'Rajesh Mehta', parentPhone: '+91 98765 43211', email: 'arjun@mail.com', attendance: 92, performance: 87, status: 'Active', gender: 'Male', joined: 'Jan 2024', address: '12 Park St, Mumbai' },
  { id: 'STU002', username: 'priya', name: 'Priya Sharma', age: 12, level: 'Intermediate', batch: 'Batch B', phone: '+91 87654 32109', parent: 'Sunita Sharma', parentPhone: '+91 87654 32108', email: 'priya@mail.com', attendance: 85, performance: 78, status: 'Active', gender: 'Female', joined: 'Mar 2024', address: '45 Lake Rd, Delhi' },
  { id: 'STU003', name: 'Rohan Das', age: 15, level: 'Beginner', batch: 'Batch A', phone: '+91 76543 21098', parent: 'Amit Das', parentPhone: '+91 76543 21097', email: 'rohan@mail.com', attendance: 70, performance: 62, status: 'Active', gender: 'Male', joined: 'Feb 2024', address: '7 Hill View, Pune' },
  { id: 'STU004', name: 'Anika Patel', age: 13, level: 'Advanced', batch: 'Batch C', phone: '+91 65432 10987', parent: 'Nira Patel', parentPhone: '+91 65432 10986', email: 'anika@mail.com', attendance: 96, performance: 94, status: 'Active', gender: 'Female', joined: 'Jan 2024', address: '3 Rose Ave, Bangalore' },
  { id: 'STU005', name: 'Kiran Nair', age: 11, level: 'Beginner', batch: 'Batch B', phone: '+91 54321 09876', parent: 'Latha Nair', parentPhone: '+91 54321 09875', email: 'kiran@mail.com', attendance: 88, performance: 71, status: 'Active', gender: 'Male', joined: 'Apr 2024', address: '9 Sea View, Kochi' },
];

export const STAFF: StaffMember[] = [
  { id: 'STF001', username: 'vikram', name: 'Vikram Singh', email: 'vikram@academy.com', phone: '+91 99887 76655', batch: 'Batch A', status: 'Active', joined: 'Jun 2023', address: '15 Green Park, Mumbai', students: 12 },
  { id: 'STF002', username: 'deepa', name: 'Deepa Rao', email: 'deepa@academy.com', phone: '+91 88776 65544', batch: 'Batch B, C', status: 'Active', joined: 'Aug 2023', address: '22 MG Road, Bangalore', students: 18 },
  { id: 'STF003', name: 'Suresh Kumar', email: 'suresh@academy.com', phone: '+91 77665 54433', batch: 'Batch C', status: 'Active', joined: 'Oct 2023', address: '5 Civil Lines, Delhi', students: 9 },
];

export const MATCHES: Match[] = [
  { id: 'MTH001', name: 'School Chess Championship', type: 'School Tournament', date: '15 Sep 2026', dayNum: 15, time: '9:00 AM', endTime: '5:00 PM', venue: "St. Joseph's School, Mumbai", status: 'Upcoming', studentIds: ['STU001', 'STU002', 'STU004'], staffIds: ['STF001'] },
  { id: 'MTH002', name: 'Academy Open Tournament', type: 'Academy Tournament', date: '20 Sep 2026', dayNum: 20, time: '10:00 AM', endTime: '4:00 PM', venue: 'Chess Academy Hall, Delhi', status: 'Upcoming', studentIds: ['STU001', 'STU003', 'STU005'], staffIds: ['STF002'] },
  { id: 'MTH003', name: 'Inter-School Chess Cup', type: 'Inter-School Tournament', date: '25 Sep 2026', dayNum: 25, time: '8:30 AM', endTime: '6:00 PM', venue: 'City Sports Complex, Jaffna', status: 'Upcoming', studentIds: ['STU001', 'STU002', 'STU003', 'STU004'], staffIds: ['STF001', 'STF002'] },
  { id: 'MTH004', name: 'Friendly Practice Match', type: 'Friendly Match', date: '5 Sep 2026', dayNum: 5, time: '3:00 PM', endTime: '6:00 PM', venue: 'Academy Training Room', status: 'Completed', studentIds: ['STU001', 'STU004', 'STU005'], staffIds: ['STF003'],
    results: {
      STU001: { played: 5, wins: 3, draws: 1, losses: 1, points: '3.5/5', rank: '2nd' },
      STU004: { played: 5, wins: 4, draws: 1, losses: 0, points: '4.5/5', rank: '1st' },
      STU005: { played: 5, wins: 1, draws: 0, losses: 4, points: '1/5', rank: '3rd' },
    } },
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const PERF_DATA = [62, 68, 71, 75, 74, 79, 82, 85, 87, 89, 88, 91];
