import { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { sortedStudents } from '../utils.js';

export function RosterView({ classroom, onAddStudent, onRenameStudent, onDeleteStudent }) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const students = sortedStudents(classroom);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddStudent(newName.trim());
    setNewName('');
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditValue(s.name);
  };

  const saveEdit = () => {
    if (editValue.trim()) onRenameStudent(editingId, editValue.trim());
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">
      <form onSubmit={handleAdd} className="flex gap-2 mb-5">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a student's name"
          aria-label="Add a student's name"
          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button type="submit" className="flex items-center gap-1 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2 rounded-lg shrink-0">
          <Plus size={16} /> Add
        </button>
      </form>

      <p className="text-sm text-stone-500 mb-3">
        {students.length} student{students.length === 1 ? '' : 's'}
      </p>

      {students.length === 0 ? (
        <div className="text-center py-12 text-stone-400 border border-dashed border-stone-300 rounded-xl">
          <Users size={28} className="mx-auto mb-2" />
          <p className="text-sm">No students yet. Add your first student above.</p>
        </div>
      ) : (
        <ul className="divide-y divide-stone-200 bg-white rounded-xl border border-stone-200">
          {students.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 px-4 py-3">
              {editingId === s.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 px-2 py-1 border border-brand-400 rounded text-sm focus:outline-none"
                />
              ) : (
                <button onClick={() => startEdit(s)} className="flex-1 text-left text-sm text-stone-800 hover:text-brand-700">
                  {s.name}
                </button>
              )}

              {confirmDeleteId === s.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      onDeleteStudent(s.id);
                      setConfirmDeleteId(null);
                    }}
                    className="text-xs px-2 py-1 rounded bg-rose-500 text-white"
                  >
                    Remove
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded bg-stone-200 text-stone-600">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDeleteId(s.id)} className="text-stone-400 hover:text-rose-500 shrink-0" aria-label={`Remove ${s.name}`}>
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
