import { Users, ClipboardList, BarChart3, User } from 'lucide-react';

export const UPPER_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A-Z
export const LOWER_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)); // a-z

export const CATEGORIES = [
  { key: 'namingUpper', label: 'Naming Uppercase', letters: UPPER_LETTERS },
  { key: 'namingLower', label: 'Naming Lowercase', letters: LOWER_LETTERS },
  { key: 'soundsUpper', label: 'Sounds Uppercase', letters: UPPER_LETTERS },
  { key: 'soundsLower', label: 'Sounds Lowercase', letters: LOWER_LETTERS },
];

export const TOTAL_LETTERS_PER_STUDENT = CATEGORIES.reduce((sum, c) => sum + c.letters.length, 0); // 104

export const RATINGS = ['M', 'D', 'NY'];
export const CYCLE = [null, 'M', 'D', 'NY'];

export const RATING_META = {
  M: { label: 'Mastered', active: 'bg-emerald-600 text-white border-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  D: { label: 'Developing', active: 'bg-amber-500 text-white border-amber-500', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  NY: { label: 'Not Yet', active: 'bg-rose-500 text-white border-rose-500', badge: 'bg-rose-100 text-rose-700 border-rose-300' },
};

export const DEFAULT_PERIODS_TEMPLATE = [
  { type: 'BOY', label: 'Beginning of Year', date: '', order: 1, fixed: true },
  { type: 'MOY', label: 'Mid-Year', date: '', order: 2, fixed: true },
  { type: 'EOY', label: 'End of Year', date: '', order: 3, fixed: true },
];

export const NAV_ITEMS = [
  { id: 'roster', label: 'Roster', icon: Users },
  { id: 'assess', label: 'Assess', icon: ClipboardList },
  { id: 'classReport', label: 'Class Report', icon: BarChart3 },
  { id: 'studentReport', label: 'Student Report', icon: User },
];
