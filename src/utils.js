import { CATEGORIES } from './constants.js';

export function csvEscape(val) {
  const s = String(val ?? '');
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function toCSV(rows) {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
}

export function downloadCSV(filename, csvContent) {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function sortedPeriods(classroom) {
  return [...classroom.periods].sort((a, b) => a.order - b.order);
}

export function sortedStudents(classroom) {
  return [...classroom.students].sort((a, b) => a.name.localeCompare(b.name));
}

export function getLetterRating(classroom, studentId, periodId, categoryKey, letter) {
  return classroom.assessments[studentId]?.[periodId]?.[categoryKey]?.[letter] || null;
}

export function categorySummary(classroom, studentId, periodId, category) {
  const counts = { M: 0, D: 0, NY: 0 };
  category.letters.forEach((L) => {
    const v = getLetterRating(classroom, studentId, periodId, category.key, L);
    if (v) counts[v]++;
  });
  const total = category.letters.length;
  const rated = counts.M + counts.D + counts.NY;
  return { ...counts, total, rated, unrated: total - rated };
}

export function studentTotalRated(classroom, studentId, periodId) {
  let rated = 0;
  CATEGORIES.forEach((c) => {
    c.letters.forEach((L) => {
      if (getLetterRating(classroom, studentId, periodId, c.key, L)) rated++;
    });
  });
  return rated;
}

export function weightedScore(counts) {
  return counts.M * 2 + counts.D * 1;
}
