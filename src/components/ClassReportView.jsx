import { useState } from 'react';
import { Download } from 'lucide-react';
import { CATEGORIES } from '../constants.js';
import { sortedPeriods, sortedStudents, getLetterRating, categorySummary, toCSV, downloadCSV } from '../utils.js';
import { Badge, SummaryCell } from './shared.jsx';

export function ClassReportView({ classroom }) {
  const periods = sortedPeriods(classroom);
  const students = sortedStudents(classroom);
  const [mode, setMode] = useState('overview'); // 'overview' | 'byLetter' | 'growth'
  const [periodId, setPeriodId] = useState(periods[0]?.id);
  const [categoryKey, setCategoryKey] = useState(CATEGORIES[0].key);

  const period = periods.find((p) => p.id === periodId) || periods[0];
  const category = CATEGORIES.find((c) => c.key === categoryKey) || CATEGORIES[0];

  const exportOverview = () => {
    if (!period) return;
    const header = ['Student'];
    CATEGORIES.forEach((c) => header.push(`${c.label} - M`, `${c.label} - D`, `${c.label} - NY`, `${c.label} - % Mastered`));
    const rows = [header];
    students.forEach((s) => {
      const row = [s.name];
      CATEGORIES.forEach((c) => {
        const counts = categorySummary(classroom, s.id, period.id, c);
        const pct = counts.total ? Math.round((counts.M / counts.total) * 100) : 0;
        row.push(counts.M, counts.D, counts.NY, `${pct}%`);
      });
      rows.push(row);
    });
    downloadCSV(`${classroom.className}_${period.label}_overview.csv`.replace(/\s+/g, '_'), toCSV(rows));
  };

  const exportByLetter = () => {
    if (!period) return;
    const rows = [['Student', ...category.letters]];
    students.forEach((s) => {
      rows.push([s.name, ...category.letters.map((L) => getLetterRating(classroom, s.id, period.id, category.key, L) || '')]);
    });
    downloadCSV(`${classroom.className}_${category.label}_${period.label}_by_letter.csv`.replace(/\s+/g, '_'), toCSV(rows));
  };

  const exportGrowth = () => {
    const header = ['Student'];
    periods.forEach((p) => header.push(`${p.label} - M`, `${p.label} - D`, `${p.label} - NY`, `${p.label} - % Mastered`));
    const rows = [header];
    students.forEach((s) => {
      const row = [s.name];
      periods.forEach((p) => {
        const counts = categorySummary(classroom, s.id, p.id, category);
        const pct = counts.total ? Math.round((counts.M / counts.total) * 100) : 0;
        row.push(counts.M, counts.D, counts.NY, `${pct}%`);
      });
      rows.push(row);
    });
    downloadCSV(`${classroom.className}_${category.label}_growth.csv`.replace(/\s+/g, '_'), toCSV(rows));
  };

  const exportAll = () => {
    const rows = [['Student', 'Assessment Period', 'Assessment Date', 'Category', 'Letter', 'Rating']];
    students.forEach((s) => {
      periods.forEach((p) => {
        CATEGORIES.forEach((c) => {
          c.letters.forEach((L) => {
            const v = getLetterRating(classroom, s.id, p.id, c.key, L);
            rows.push([s.name, p.label, p.date || '', c.label, L, v || 'Not assessed']);
          });
        });
      });
    });
    downloadCSV(`${classroom.className}_all_data.csv`.replace(/\s+/g, '_'), toCSV(rows));
  };

  if (!period) {
    return <div className="max-w-5xl mx-auto px-4 py-5 text-sm text-stone-500">No assessment periods yet.</div>;
  }

  const exportHandler = mode === 'overview' ? exportOverview : mode === 'byLetter' ? exportByLetter : exportGrowth;

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-lg border border-stone-300 overflow-hidden">
          <button
            onClick={() => setMode('overview')}
            className={'px-3 py-1.5 text-sm font-medium ' + (mode === 'overview' ? 'bg-teal-700 text-white' : 'bg-white text-stone-600 hover:bg-stone-100')}
          >
            Overview
          </button>
          <button
            onClick={() => setMode('byLetter')}
            className={
              'px-3 py-1.5 text-sm font-medium border-l border-stone-300 ' +
              (mode === 'byLetter' ? 'bg-teal-700 text-white' : 'bg-white text-stone-600 hover:bg-stone-100')
            }
          >
            By Letter
          </button>
          <button
            onClick={() => setMode('growth')}
            className={
              'px-3 py-1.5 text-sm font-medium border-l border-stone-300 ' +
              (mode === 'growth' ? 'bg-teal-700 text-white' : 'bg-white text-stone-600 hover:bg-stone-100')
            }
          >
            Growth
          </button>
        </div>

        {(mode === 'overview' || mode === 'byLetter') && (
          <select value={period.id} onChange={(e) => setPeriodId(e.target.value)} className="px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white">
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        )}

        {(mode === 'byLetter' || mode === 'growth') && (
          <select value={category.key} onChange={(e) => setCategoryKey(e.target.value)} className="px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white">
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        )}

        <div className="w-full sm:w-auto sm:ml-auto flex gap-2">
          <button onClick={exportHandler} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100">
            <Download size={14} /> Export view
          </button>
          <button onClick={exportAll} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-teal-700 text-teal-700 rounded-lg hover:bg-teal-50">
            <Download size={14} /> Export all data
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 text-stone-400 border border-dashed border-stone-300 rounded-xl">
          <p className="text-sm">Add students in the Roster tab first.</p>
        </div>
      ) : mode === 'overview' ? (
        <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-2 font-medium text-stone-600 sticky left-0 bg-stone-50">Student</th>
                {CATEGORIES.map((c) => (
                  <th key={c.key} className="text-center px-3 py-2 font-medium text-stone-600 whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-2 text-stone-800 font-medium sticky left-0 bg-white whitespace-nowrap">{s.name}</td>
                  {CATEGORIES.map((c) => (
                    <td key={c.key} className="text-center px-3 py-2">
                      <SummaryCell counts={categorySummary(classroom, s.id, period.id, c)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : mode === 'byLetter' ? (
        <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-2 font-medium text-stone-600 sticky left-0 bg-stone-50">Student</th>
                {category.letters.map((L) => (
                  <th key={L} className="text-center px-2 py-2 font-medium text-stone-600">
                    {L}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-2 text-stone-800 font-medium sticky left-0 bg-white whitespace-nowrap">{s.name}</td>
                  {category.letters.map((L) => (
                    <td key={L} className="text-center px-2 py-2">
                      <Badge value={getLetterRating(classroom, s.id, period.id, category.key, L)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-stone-50 border-t-2 border-stone-300">
                <td className="px-4 py-2 font-semibold text-stone-700 sticky left-0 bg-stone-50 whitespace-nowrap">Class mastered</td>
                {category.letters.map((L) => {
                  const count = students.filter((s) => getLetterRating(classroom, s.id, period.id, category.key, L) === 'M').length;
                  return (
                    <td key={L} className="text-center px-2 py-2 text-xs font-semibold text-stone-600 whitespace-nowrap">
                      {count}/{students.length}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 py-2 font-medium text-stone-600 sticky left-0 bg-stone-50">Student</th>
                {periods.map((p) => (
                  <th key={p.id} className="text-center px-3 py-2 font-medium text-stone-600 whitespace-nowrap">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-2 text-stone-800 font-medium sticky left-0 bg-white whitespace-nowrap">{s.name}</td>
                  {periods.map((p) => (
                    <td key={p.id} className="text-center px-3 py-2">
                      <SummaryCell counts={categorySummary(classroom, s.id, p.id, category)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
