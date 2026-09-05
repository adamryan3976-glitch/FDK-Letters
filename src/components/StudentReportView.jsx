import { useState } from 'react';
import { Download } from 'lucide-react';
import { CATEGORIES } from '../constants.js';
import { sortedPeriods, sortedStudents, getLetterRating, categorySummary, weightedScore, toCSV, downloadCSV } from '../utils.js';
import { SummaryCell, LetterGridStatic, RatingLegend } from './shared.jsx';

export function StudentReportView({ classroom, selectedStudentId, setSelectedStudentId }) {
  const students = sortedStudents(classroom);
  const student = students.find((s) => s.id === selectedStudentId) || students[0];
  const periods = sortedPeriods(classroom);
  const [detailPeriodId, setDetailPeriodId] = useState(periods[periods.length - 1]?.id);
  const detailPeriod = periods.find((p) => p.id === detailPeriodId) || periods[periods.length - 1];

  const trend = (pIndex, category) => {
    const curr = categorySummary(classroom, student.id, periods[pIndex].id, category);
    if (curr.rated === 0) return null;
    for (let i = pIndex - 1; i >= 0; i--) {
      const prev = categorySummary(classroom, student.id, periods[i].id, category);
      if (prev.rated > 0) {
        const diff = weightedScore(curr) - weightedScore(prev);
        if (diff > 0) return 'up';
        if (diff < 0) return 'down';
        return null;
      }
    }
    return null;
  };

  const exportStudent = () => {
    if (!student) return;
    const rows = [['Assessment Period', 'Assessment Date', 'Category', 'Letter', 'Rating']];
    periods.forEach((p) => {
      CATEGORIES.forEach((c) => {
        c.letters.forEach((L) => {
          const v = getLetterRating(classroom, student.id, p.id, c.key, L);
          rows.push([p.label, p.date || '', c.label, L, v || 'Not assessed']);
        });
      });
    });
    downloadCSV(`${student.name}_progress.csv`.replace(/\s+/g, '_'), toCSV(rows));
  };

  if (!student) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="text-center py-12 text-stone-400 border border-dashed border-stone-300 rounded-xl">
          <p className="text-sm">Add students in the Roster tab first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={student.id} onChange={(e) => setSelectedStudentId(e.target.value)} className="px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white">
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button onClick={exportStudent} className="ml-auto flex items-center gap-1 text-sm px-3 py-1.5 border border-brand-700 text-brand-700 rounded-lg hover:bg-brand-50">
          <Download size={14} /> Export
        </button>
      </div>

      <p className="text-sm font-medium text-stone-700 mb-2">Progress over time</p>
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="text-left px-4 py-2 font-medium text-stone-600 whitespace-nowrap">Assessment</th>
              {CATEGORIES.map((c) => (
                <th key={c.key} className="text-center px-3 py-2 font-medium text-stone-600 whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((p, i) => (
              <tr key={p.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-2 text-stone-800 font-medium whitespace-nowrap">
                  {p.label}
                  {p.date && <span className="block text-xs text-stone-400">{p.date}</span>}
                </td>
                {CATEGORIES.map((c) => {
                  const t = trend(i, c);
                  return (
                    <td key={c.key} className="text-center px-3 py-2">
                      <div className="inline-flex items-center gap-1">
                        <SummaryCell counts={categorySummary(classroom, student.id, p.id, c)} />
                        {t === 'up' && (
                          <span className="text-emerald-600 text-xs shrink-0" title="Improved since last assessment">
                            ▲
                          </span>
                        )}
                        {t === 'down' && (
                          <span className="text-rose-500 text-xs shrink-0" title="Declined since last assessment">
                            ▼
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-medium text-stone-700">Letter-by-letter detail for</p>
        <select value={detailPeriod?.id} onChange={(e) => setDetailPeriodId(e.target.value)} className="px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white">
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <RatingLegend />
      <div className="space-y-3">
        {detailPeriod &&
          CATEGORIES.map((c) => <LetterGridStatic key={c.key} category={c} classroom={classroom} studentId={student.id} periodId={detailPeriod.id} />)}
      </div>
    </div>
  );
}
