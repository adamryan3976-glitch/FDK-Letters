import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

export function ClassModal({ show, onClose, classIndex, activeClassId, onCreateClass, onSwitchClass, onDeleteClass }) {
  const [teacherName, setTeacherName] = useState('');
  const [className, setClassName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (!show) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!teacherName.trim() || !className.trim()) return;
    onCreateClass(teacherName.trim(), className.trim());
    setTeacherName('');
    setClassName('');
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="font-bold text-stone-800">Manage classes</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-4 max-h-64 overflow-y-auto">
          {classIndex.length === 0 && <p className="text-sm text-stone-500">No classes yet. Create your first one below.</p>}
          <ul className="space-y-2">
            {classIndex.map((c) => (
              <li
                key={c.id}
                className={
                  'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border ' +
                  (c.id === activeClassId ? 'border-teal-600 bg-teal-50' : 'border-stone-200')
                }
              >
                <button
                  onClick={() => {
                    onSwitchClass(c.id);
                    onClose();
                  }}
                  className="text-left flex-1 min-w-0"
                >
                  <div className="text-sm font-medium text-stone-800 truncate">{c.className}</div>
                  <div className="text-xs text-stone-500 truncate">Teacher: {c.teacherName}</div>
                </button>
                {confirmDeleteId === c.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        onDeleteClass(c.id);
                        setConfirmDeleteId(null);
                      }}
                      className="text-xs px-2 py-1 rounded bg-rose-500 text-white"
                    >
                      Delete
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded bg-stone-200 text-stone-600">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(c.id)} className="text-stone-400 hover:text-rose-500 shrink-0" aria-label={`Delete ${c.className}`}>
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleCreate} className="px-5 py-4 border-t border-stone-200 space-y-2">
          <p className="text-sm font-medium text-stone-700">Add a new class</p>
          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="Teacher name"
            aria-label="Teacher name"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Class name (e.g., Room 12)"
            aria-label="Class name"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium py-2 rounded-lg">
            Create class
          </button>
        </form>
      </div>
    </div>
  );
}
