import { NAV_ITEMS } from '../constants.js';

export function Header({ classroom, user, onOpenClassModal, onSignOut, saving }) {
  return (
    <header className="bg-brand-800 text-white border-b-4 border-gold-500">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo-header.png" alt="" className="w-10 h-10 rounded-lg shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight truncate">FDK Alphabet Tracker</h1>
            {classroom ? (
              <p className="text-brand-200 text-xs truncate">
                {classroom.className} (Teacher: {classroom.teacherName})
              </p>
            ) : (
              <p className="text-brand-200 text-xs truncate">No class selected</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {classroom && <span className="text-xs text-brand-200 hidden sm:inline">{saving ? 'Saving…' : 'Saved'}</span>}
          <button
            onClick={onOpenClassModal}
            className="bg-brand-700 hover:bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-md border border-brand-600"
          >
            Classes
          </button>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Account'}
              title={`${user.displayName || ''} \u2014 sign out`}
              onClick={onSignOut}
              className="w-8 h-8 rounded-full border border-brand-600 cursor-pointer"
            />
          ) : (
            <button onClick={onSignOut} className="text-brand-200 text-xs hover:text-white underline">
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function NavTabs({ view, setView }) {
  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 pt-2 flex gap-1 overflow-x-auto border-b border-stone-300">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={
              'flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg border whitespace-nowrap ' +
              (active
                ? 'bg-stone-50 text-brand-800 border-stone-300 border-b-stone-50 -mb-px'
                : 'bg-stone-100 text-stone-500 border-transparent hover:bg-stone-200 hover:text-stone-700')
            }
          >
            <Icon size={16} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
