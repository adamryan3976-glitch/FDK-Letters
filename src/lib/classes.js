import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';
import { DEFAULT_PERIODS_TEMPLATE } from '../constants.js';

// Every class document lives at users/{uid}/classes/{classId}. Firestore
// security rules (see firestore.rules) restrict that whole path to the
// signed-in user whose uid matches {uid}, so one teacher can never read or
// write another teacher's data.

function classesRef(userId) {
  return collection(db, 'users', userId, 'classes');
}

export async function listClasses(userId) {
  const snap = await getDocs(query(classesRef(userId), orderBy('createdAt', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getClass(userId, classId) {
  const snap = await getDoc(doc(db, 'users', userId, 'classes', classId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createClass(userId, teacherName, className) {
  const ref = doc(classesRef(userId));
  const data = {
    teacherName,
    className,
    createdAt: Date.now(),
    students: [],
    periods: DEFAULT_PERIODS_TEMPLATE.map((p) => ({ ...p, id: crypto.randomUUID() })),
    assessments: {},
  };
  await setDoc(ref, data);
  return { id: ref.id, ...data };
}

export async function saveClass(userId, classroom) {
  const { id, ...data } = classroom;
  await setDoc(doc(db, 'users', userId, 'classes', id), data);
}

export async function deleteClass(userId, classId) {
  await deleteDoc(doc(db, 'users', userId, 'classes', classId));
}
