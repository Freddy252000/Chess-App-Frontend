import { Role, STUDENTS, STAFF } from './mock';

// In-memory API adapter for local UI development. Replace with fetch calls when a backend is available.
export type TempUser = { username: string; password: string; role: Role; name: string };
export const tempUsers: TempUser[] = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' },
  { username: 'vikram', password: 'staff123', role: 'staff', name: 'Vikram Singh' },
  { username: 'arjun', password: 'student123', role: 'student', name: 'Arjun Mehta' },
];

export async function loginApi(username: string, password: string) {
  const user = tempUsers.find(item => item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password);
  if (!user) throw new Error('Username or password is incorrect.');
  return user;
}

export async function addStudentApi(input: Record<string, any>) {
  const id = `STU${String(STUDENTS.length + 1).padStart(3, '0')}`;
  const record = { id, name: input.name, age: Number(input.age) || 10, level: input.level || 'Beginner', batch: input.batch || 'Batch A', phone: input.phone || '', parent: input.parent || '', parentPhone: input.parentPhone || '', email: input.email || input.username, attendance: 0, performance: 0, status: 'Active', gender: input.gender || 'Other', joined: input.joined || 'Oct 2026', address: input.address || '', photo: input.photo || '' };
  STUDENTS.push(record as any);
  if (input.username && input.password) tempUsers.push({ username: input.username, password: input.password, role: 'student', name: input.name });
  return record;
}

export async function addStaffApi(input: Record<string, any>) {
  const id = `STF${String(STAFF.length + 1).padStart(3, '0')}`;
  const record = { id, name: input.name, email: input.email || input.username, phone: input.phone || '', batch: input.batch || 'Batch A', status: input.status || 'Active', joined: input.joined || 'Oct 2026', address: input.address || '', students: 0, photo: input.photo || '' };
  STAFF.push(record as any);
  if (input.username && input.password) tempUsers.push({ username: input.username, password: input.password, role: 'staff', name: input.name });
  return record;
}
