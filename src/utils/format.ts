import { MONTHS } from '../data/types';

export const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const yesterdayISO = () => { const d = new Date(); d.setDate(d.getDate() - 1); return toISO(d); };
export const isISODate = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
export const isTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export const fmtDate = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : iso;
};
export const fmtTime = (t: string) => {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return t || 'TBD';
  const h = +m[1];
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const shiftMonth = (key: string, delta: number) => {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
};
const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthTitle = (key: string) => { const [y, m] = key.split('-').map(Number); return `${FULL[m - 1]} ${y}`; };

export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d < 7 ? `${d}d ago` : fmtDate(iso.slice(0, 10));
};

/** "Batch B, C" -> ["Batch B", "Batch C"] */
export const batchesOf = (batch?: string) => (batch?.match(/\b[A-Z]\b/g) ?? []).map(l => `Batch ${l}`);
export const signed = (n: number) => `${n >= 0 ? '+' : ''}${n}`;
