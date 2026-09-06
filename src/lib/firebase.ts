import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { OperationalTaskData, SavedTaskRecord } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore targeting the provisioned database ID
const firestoreDbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId.trim() !== ''
  ? firebaseConfig.firestoreDatabaseId
  : '(default)';

export const db = getFirestore(app, firestoreDbId);

/**
 * Sign in using Google OAuth via Firebase Authentication popup.
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled by user.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Another sign-in attempt was already in progress.');
    }
    throw new Error(error.message || 'Failed to authenticate with Google.');
  }
}

/**
 * Sign out current user.
 */
export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Get current user ID token for authorized backend requests.
 */
export async function getCurrentUserIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

/**
 * Save operational task to Firestore under users/{userId}/tasks/{taskId}
 * Strictly isolated to the authenticated user.
 */
export async function saveTaskToFirestore(
  userId: string,
  taskData: OperationalTaskData
): Promise<string> {
  if (!userId) {
    throw new Error('Authentication required to persist task.');
  }

  const tasksRef = collection(db, 'users', userId, 'tasks');
  const docRef = await addDoc(tasksRef, {
    ...taskData,
    savedAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Real-time listener for user's isolated task history.
 */
export function subscribeUserTasks(
  userId: string,
  onUpdate: (tasks: SavedTaskRecord[]) => void,
  onError: (err: Error) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: SavedTaskRecord[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        userId,
        ...(docSnap.data() as OperationalTaskData),
      }));
      onUpdate(records);
    },
    (error) => {
      console.error('Error fetching tasks from Firestore:', error);
      onError(error);
    }
  );
}

/**
 * Delete a specific task from user's history in Firestore.
 */
export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  if (!userId || !taskId) {
    throw new Error('Invalid user or task ID for deletion.');
  }
  const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskDocRef);
}
