import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES, TOTAL_LETTERS_PER_STUDENT } from '../constants.js';
import { sortedPeriods, sortedStudents, studentTotalRated } from '../utils.js';
import { LetterGrid } from './shared.jsx';

export function AssessView({
  classroom,
  selectedPeriodId,
  setSelectedPeriodId,
  assessStudentId,
  setAssessStudentId,
  onSetLetter,
  onAddPeriod,
  onDeletePeriod,
}) {
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [periodLabel, setPeriodLabel] = useState('');
  const [periodDate, setPeriodDate] = useState('');
  const [insertAfter, setInsertAfter] = useState('');

  const periods = sortedPeriods(classroom);
  const period = periods.find((p) => p.id === selectedPeriodId) || periods[0];
  const students = sortedStudents(classroom);
  const student = students.find((s) => s.id === assessStudentId) || null;
  const studentIdx = student ? students.findIndex((s) => s.id === student.id) : -1;

  const fullyAssessedCount = period ? students.filter((s) => studentTotalRated(classroom, s.id, period.id) === TOTAL_LETTERS_PER_STUDENT).length : 0;

  const handleAddPeriod = (e) => {
    e.preventDefault();
    if (!periodLabel.trim()) return;
    onAddPeriod(periodLabel.trim(), periodDate, insertAfter || periods[periods.length - 1].id);
    setPeriodLabel('');
    setPeriodDate('');
    setInsertAfter('');
    setShowAddPeriod(false);
  };

  const goPrevStudent = () => {
    if (studentIdx > 0) setAssessStudentId(students[studentIdx - 1].id);
  };
  const goNextStudent = () => {
    if (studentIdx >= 0 && studentIdx < students.length - 1) setAssessStudentId(students[studentIdx + 1].id);
  };

  if (!period) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPeriodId(p.id)}
            className={
              'px-3 py-1.5 text-sm font-medium rounded-full border ' +
              (p.id === period.id ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100')
            }
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setShowAddPeriod((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full border border-dashed border-stone-400 text-stone-500 hover:bg-stone-100"
        >
          <Plus size={14} /> Add assessment
        </button>
      </div>

      {showAddPeriod && (
        <form onSubmit={handleAddPeriod} className="bg-white border border-stone-200 rounded-xl p-4 mb-4 space-y-2">
          <p className="text-sm font-medium text-stone-700">New assessment</p>
          <input
            type="text"
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="Label (e.g., November Check-In)"
            aria-label="Assessment label"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={periodDate}
              onChange={(e) => setPeriodDate(e.target.value)}
              aria-label="Assessment date"
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select
              value={insertAfter}
              onChange={(e) => setInsertAfter(e.target.value)}
              aria-label="Insert position"
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  Insert after {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Add
            </button>
            <button type="button" onClick={() => setShowAddPeriod(false)} className="text-stone-500 text-sm px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!period.fixed && !student && (
        <div className="flex justify-end mb-3">
          <button onClick={() => onDeletePeriod(period.id)} className="text-xs text-stone-400 hover:text-rose-500 flex items-center gap-1">
            <Trash2 size={13} /> Remove this assessment
          </button>
        </div>
      )}

      {students.length === 0 ? (
        <div className="text-center py-12 text-stone-400 border border-dashed border-stone-300 rounded-xl">
          <p className="text-sm">Add students in the Roster tab first.</p>
        </div>
      ) : !student ? (
        <>
          <p className="text-sm text-stone-500 mb-3">
            {fullyAssessedCount} of {students.length} students fully assessed for {period.label}
          </p>
          <ul className="divide-y divide-stone-200 bg-white rounded-xl border border-stone-200">
            {students.map((s) => {
              const rated = studentTotalRated(classroom, s.id, period.id);
              return (
                <li key={s.id}>
                  <button onClick={() => setAssessStudentId(s.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-stone-50">
                    <span className="text-sm text-stone-800">{s.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-stone-400">
                        {rated}/{TOTAL_LETTERS_PER_STUDENT}
                      </span>
                      <span className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden inline-block">
                        <span className="h-full bg-teal-600 block" style={{ width: `${(rated / TOTAL_LETTERS_PER_STUDENT) * 100}%` }} />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <button onClick={() => setAssessStudentId(null)} className="flex items-center gap-1 text-sm text-teal-700 hover:underline">
              <ChevronLeft size={16} /> All students
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrevStudent}
                disabled={studentIdx <= 0}
                className="p-1.5 rounded-md border border-stone-300 text-stone-500 disabled:opacity-30 hover:bg-stone-100"
                aria-label="Previous student"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-stone-800">{student.name}</span>
              <button
                onClick={goNextStudent}
                disabled={studentIdx >= students.length - 1}
                className="p-1.5 rounded-md border border-stone-300 text-stone-500 disabled:opacity-30 hover:bg-stone-100"
                aria-label="Next student"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {CATEGORIES.map((c) => (
              <LetterGrid key={c.key} category={c} classroom={classroom} studentId={student.id} periodId={period.id} onSetLetter={onSetLetter} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
