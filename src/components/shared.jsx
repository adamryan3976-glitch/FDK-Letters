import { RATING_META, CYCLE } from '../constants.js';
import { getLetterRating, categorySummary } from '../utils.js';

export function MiniBar({ counts, total }) {
  const pct = (n) => (total ? (n / total) * 100 : 0);
  return (
    <div className="flex h-2 w-full rounded-full overflow-hidden bg-stone-200">
      {counts.M > 0 && <div className="bg-emerald-500" style={{ width: `${pct(counts.M)}%` }} />}
      {counts.D > 0 && <div className="bg-amber-400" style={{ width: `${pct(counts.D)}%` }} />}
      {counts.NY > 0 && <div className="bg-rose-400" style={{ width: `${pct(counts.NY)}%` }} />}
    </div>
  );
}

export function SummaryCell({ counts }) {
  return (
    <div className="w-20 mx-auto">
      <MiniBar counts={counts} total={counts.total} />
      <p className="text-xs text-stone-500 mt-0.5 text-center whitespace-nowrap">
        {counts.M}/{counts.total} M
      </p>
    </div>
  );
}

export function RatingLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 mb-3">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" /> Mastered
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Developing
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> Not Yet
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-white border border-stone-300 inline-block" /> Not assessed
      </span>
    </div>
  );
}

export function Badge({ value }) {
  if (!value) {
    return <span className="inline-block text-xs text-stone-300 border border-dashed border-stone-300 rounded-full px-2 py-0.5">&mdash;</span>;
  }
  const meta = RATING_META[value];
  return <span className={'inline-block text-xs font-bold border rounded-full px-2 py-0.5 ' + meta.badge}>{value}</span>;
}

export function LetterCell({ letter, value, onChange }) {
  const meta = value ? RATING_META[value] : null;
  const handleClick = () => {
    const idx = CYCLE.indexOf(value);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    onChange(next);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        'aspect-square flex items-center justify-center rounded-md border text-sm font-bold transition-colors ' +
        (value ? meta.active : 'bg-white text-stone-400 border-stone-300 hover:bg-stone-100 hover:text-stone-600')
      }
      aria-label={`Letter ${letter}: ${value ? meta.label : 'not assessed'}. Tap to change.`}
      title={value ? meta.label : 'Not assessed \u2014 tap to rate'}
    >
      {letter}
    </button>
  );
}

export function LetterGrid({ category, classroom, studentId, periodId, onSetLetter }) {
  const summary = categorySummary(classroom, studentId, periodId, category);
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-stone-800">{category.label}</p>
        <p className="text-xs text-stone-500">
          {summary.rated}/{summary.total} rated
        </p>
      </div>
      <MiniBar counts={summary} total={summary.total} />
      <div className="mt-3 grid grid-cols-6 sm:grid-cols-9 gap-1.5">
        {category.letters.map((L) => (
          <LetterCell
            key={L}
            letter={L}
            value={getLetterRating(classroom, studentId, periodId, category.key, L)}
            onChange={(val) => onSetLetter(studentId, periodId, category.key, L, val)}
          />
        ))}
      </div>
    </div>
  );
}

export function LetterGridStatic({ category, classroom, studentId, periodId }) {
  const summary = categorySummary(classroom, studentId, periodId, category);
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-stone-800">{category.label}</p>
        <p className="text-xs text-stone-500">
          {summary.rated}/{summary.total} rated
        </p>
      </div>
      <MiniBar counts={summary} total={summary.total} />
      <div className="mt-3 grid grid-cols-6 sm:grid-cols-9 gap-1.5">
        {category.letters.map((L) => {
          const v = getLetterRating(classroom, studentId, periodId, category.key, L);
          const meta = v ? RATING_META[v] : null;
          return (
            <div
              key={L}
              className={
                'aspect-square flex items-center justify-center rounded-md border text-sm font-bold ' +
                (v ? meta.active : 'bg-stone-50 text-stone-300 border-stone-200')
              }
              title={v ? meta.label : 'Not assessed'}
            >
              {L}
            </div>
          );
        })}
      </div>
    </div>
  );
}
