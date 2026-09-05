import { useState, useEffect, useRef } from 'react';
import { Header, NavTabs } from './Header.jsx';
import { ClassModal } from './ClassModal.jsx';
import { RosterView } from './RosterView.jsx';
import { AssessView } from './AssessView.jsx';
import { ClassReportView } from './ClassReportView.jsx';
import { StudentReportView } from './StudentReportView.jsx';
import { listClasses, getClass, createClass as createClassDoc, saveClass, deleteClass as deleteClassDoc } from '../lib/classes.js';

export function ClassroomApp({ user, onSignOut }) {
  const [loading, setLoading] = useState(true);
  const [classIndex, setClassIndex] = useState([]);
  const [activeClassId, setActiveClassId] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [view, setView] = useState('roster');
  const [showClassModal, setShowClassModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [assessStudentId, setAssessStudentId] = useState(null);
  const [toast, setToast] = useState(null);
  const saveTimerRef = useRef(null);

  const lastActiveKey = `activeClass:${user.uid}`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await listClasses(user.uid);
      setClassIndex(list.map(({ id, teacherName, className }) => ({ id, teacherName, className })));

      let storedId = null;
      try {
        storedId = localStorage.getItem(lastActiveKey);
      } catch {
        // localStorage can be unavailable (e.g. private browsing); fall back below.
      }
      const activeId = storedId && list.some((c) => c.id === storedId) ? storedId : list[0]?.id || null;

      if (activeId) {
        const data = list.find((c) => c.id === activeId) || null;
        if (data) {
          setClassroom(data);
          setActiveClassId(activeId);
          const sorted = [...data.periods].sort((a, b) => a.order - b.order);
          setSelectedPeriodId(sorted[0]?.id || null);
          setSelectedStudentId(data.students[0]?.id || null);
        } else {
          setShowClassModal(true);
        }
      } else {
        setShowClassModal(true);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  useEffect(() => {
    if (!classroom) return;
    setSaving(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await saveClass(user.uid, classroom);
      } catch (e) {
        console.error('Save failed', e);
      }
      setSaving(false);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroom]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const rememberActive = (id) => {
    try {
      if (id) localStorage.setItem(lastActiveKey, id);
      else localStorage.removeItem(lastActiveKey);
    } catch {
      // ignore
    }
  };

  const handleCreateClass = async (teacherName, className) => {
    const newClass = await createClassDoc(user.uid, teacherName, className);
    setClassIndex((prev) => [...prev, { id: newClass.id, teacherName, className }]);
    setClassroom(newClass);
    setActiveClassId(newClass.id);
    setSelectedPeriodId(newClass.periods[0].id);
    setSelectedStudentId(null);
    setAssessStudentId(null);
    setShowClassModal(false);
    rememberActive(newClass.id);
    showToast('Class created');
  };

  const handleSwitchClass = async (id) => {
    if (id === activeClassId) return;
    const data = await getClass(user.uid, id);
    if (!data) return;
    setClassroom(data);
    setActiveClassId(id);
    const sorted = [...data.periods].sort((a, b) => a.order - b.order);
    setSelectedPeriodId(sorted[0]?.id || null);
    setSelectedStudentId(data.students[0]?.id || null);
    setAssessStudentId(null);
    rememberActive(id);
  };

  const handleDeleteClass = async (id) => {
    await deleteClassDoc(user.uid, id);
    const newIndex = classIndex.filter((c) => c.id !== id);
    setClassIndex(newIndex);
    if (id === activeClassId) {
      if (newIndex.length > 0) {
        await handleSwitchClass(newIndex[0].id);
      } else {
        setClassroom(null);
        setActiveClassId(null);
        setAssessStudentId(null);
        rememberActive(null);
        setShowClassModal(true);
      }
    }
    showToast('Class deleted');
  };

  const updateClassroom = (updater) => {
    setClassroom((prev) => (prev ? updater(prev) : prev));
  };

  const handleAddStudent = (name) => {
    updateClassroom((prev) => ({ ...prev, students: [...prev.students, { id: crypto.randomUUID(), name }] }));
  };

  const handleRenameStudent = (studentId, name) => {
    updateClassroom((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === studentId ? { ...s, name } : s)),
    }));
  };

  const handleDeleteStudent = (studentId) => {
    updateClassroom((prev) => {
      const assessments = { ...prev.assessments };
      delete assessments[studentId];
      return { ...prev, students: prev.students.filter((s) => s.id !== studentId), assessments };
    });
    setAssessStudentId((prev) => (prev === studentId ? null : prev));
    setSelectedStudentId((prev) => (prev === studentId ? null : prev));
  };

  const handleAddPeriod = (label, date, insertAfterId) => {
    updateClassroom((prev) => {
      const sorted = [...prev.periods].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((p) => p.id === insertAfterId);
      const afterOrder = sorted[idx]?.order ?? sorted[sorted.length - 1].order;
      const nextOrder = sorted[idx + 1]?.order;
      const newOrder = nextOrder !== undefined ? (afterOrder + nextOrder) / 2 : afterOrder + 1;
      const newPeriod = { id: crypto.randomUUID(), type: 'ADDITIONAL', label, date, order: newOrder, fixed: false };
      return { ...prev, periods: [...prev.periods, newPeriod] };
    });
  };

  const handleDeletePeriod = (periodId) => {
    updateClassroom((prev) => {
      const assessments = {};
      Object.entries(prev.assessments).forEach(([sid, byPeriod]) => {
        const copy = { ...byPeriod };
        delete copy[periodId];
        assessments[sid] = copy;
      });
      return { ...prev, periods: prev.periods.filter((p) => p.id !== periodId), assessments };
    });
  };

  const handleSetLetter = (studentId, periodId, categoryKey, letter, value) => {
    updateClassroom((prev) => {
      const studentAssessments = { ...(prev.assessments[studentId] || {}) };
      const periodRec = { ...(studentAssessments[periodId] || {}) };
      const categoryRec = { ...(periodRec[categoryKey] || {}) };
      if (value) categoryRec[letter] = value;
      else delete categoryRec[letter];
      periodRec[categoryKey] = categoryRec;
      studentAssessments[periodId] = periodRec;
      return { ...prev, assessments: { ...prev.assessments, [studentId]: studentAssessments } };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-400 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <Header classroom={classroom} user={user} onOpenClassModal={() => setShowClassModal(true)} onSignOut={onSignOut} saving={saving} />

      {classroom ? (
        <>
          <NavTabs view={view} setView={setView} />
          {view === 'roster' && (
            <RosterView classroom={classroom} onAddStudent={handleAddStudent} onRenameStudent={handleRenameStudent} onDeleteStudent={handleDeleteStudent} />
          )}
          {view === 'assess' && (
            <AssessView
              classroom={classroom}
              selectedPeriodId={selectedPeriodId}
              setSelectedPeriodId={setSelectedPeriodId}
              assessStudentId={assessStudentId}
              setAssessStudentId={setAssessStudentId}
              onSetLetter={handleSetLetter}
              onAddPeriod={handleAddPeriod}
              onDeletePeriod={handleDeletePeriod}
            />
          )}
          {view === 'classReport' && <ClassReportView classroom={classroom} />}
          {view === 'studentReport' && (
            <StudentReportView classroom={classroom} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} />
          )}
        </>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <img src="/icon-192.png" alt="" className="w-16 h-16 rounded-2xl mx-auto mb-4 opacity-80" />
          <p className="text-stone-500 mb-4">Create a class to get started.</p>
          <button onClick={() => setShowClassModal(true)} className="bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Create a class
          </button>
        </div>
      )}

      <ClassModal
        show={showClassModal}
        onClose={() => setShowClassModal(false)}
        classIndex={classIndex}
        activeClassId={activeClassId}
        onCreateClass={handleCreateClass}
        onSwitchClass={handleSwitchClass}
        onDeleteClass={handleDeleteClass}
      />

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">{toast}</div>}
    </div>
  );
}
