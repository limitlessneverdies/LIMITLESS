import { MistakeLog, ExamAttempt } from '../types';

const BASE_MISTAKES_KEY = 'met_prep_mistakes';
const BASE_ATTEMPTS_KEY = 'met_prep_attempts';
const LEADERBOARD_KEY = 'met_leaderboard';
const LOCKS_KEY = 'met_set_locks';

export interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  score: number;
  correctCount: number;
  timeSpentSeconds: number;
  setNum: number;
  school: string;
  date: string;
  isCurrentUser?: boolean;
}

// Get current logged in user from LocalStorage cache
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('limitless_curr_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Write logged in user to LocalStorage
export function setCurrentUser(user: { name: string; email: string; school: string; isAdmin?: boolean }) {
  try {
    localStorage.setItem('limitless_curr_user', JSON.stringify(user));
    // Synchronously submit to Express backend real login handler
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Real database user synchronization completed successfully.");
          // Track visit on launch / log in
          trackVisitOnServer(user.email);
        }
      }).catch(err => console.error("Error registering user with backend:", err));
  } catch (e) {
    console.error(e);
  }
}

function getUserSuffix(): string {
  const user = getCurrentUser();
  return user ? `_${encodeURIComponent(user.email)}` : '_guest';
}

// 1. Visit Tracking Trigger
export function trackVisitOnServer(email?: string) {
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email || null })
  }).catch(() => {});
}

// 2. Mistakes Management (Synced with Express)
export function getMistakeLogs(): MistakeLog[] {
  try {
    const raw = localStorage.getItem(BASE_MISTAKES_KEY + getUserSuffix());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function syncMistakesWithServer(): Promise<MistakeLog[]> {
  const user = getCurrentUser();
  if (!user) return getMistakeLogs();
  
  try {
    const res = await fetch(`/api/mistakes?email=${encodeURIComponent(user.email)}`);
    if (res.ok) {
      const serverMistakes = await res.json();
      localStorage.setItem(BASE_MISTAKES_KEY + getUserSuffix(), JSON.stringify(serverMistakes));
      return serverMistakes;
    }
  } catch (err) {
    console.error("Failed to sync mistakes with backend:", err);
  }
  return getMistakeLogs();
}

export async function saveMistakeLog(log: Omit<MistakeLog, 'id' | 'timestamp'>) {
  try {
    const user = getCurrentUser();
    const payload = {
      ...log,
      email: user ? user.email : 'guest@met.com',
      name: user ? user.name : 'Guest User'
    };
    
    // Save locally first for fast client feedback
    const logs = getMistakeLogs();
    const exists = logs.some(l => l.questionId === log.questionId && l.selectedAnswer === log.selectedAnswer);
    if (!exists) {
      const newLog: MistakeLog = {
        ...log,
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      };
      logs.unshift(newLog);
      localStorage.setItem(BASE_MISTAKES_KEY + getUserSuffix(), JSON.stringify(logs));
    }

    // Push to real server database
    await fetch('/api/mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('Failed to save mistake log:', e);
  }
}

export async function removeMistakeLog(id: string) {
  try {
    // Delete locally
    const logs = getMistakeLogs();
    const filtered = logs.filter(l => l.id !== id);
    localStorage.setItem(BASE_MISTAKES_KEY + getUserSuffix(), JSON.stringify(filtered));

    // Delete server-side
    // Check if ID is a server generated or temporary local id
    if (id.startsWith('log-')) {
      // Local ID, let's sync up, or simply try deleting
      // For precision, match via API delete
    }
    await fetch(`/api/mistakes/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error('Failed to remove mistake:', e);
  }
}

export function clearAllMistakes() {
  try {
    localStorage.removeItem(BASE_MISTAKES_KEY + getUserSuffix());
  } catch (e) {
    console.error(e);
  }
}

// 3. Exam Attempts Management (Synced with Express)
export function getExamAttempts(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(BASE_ATTEMPTS_KEY + getUserSuffix());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function syncExamAttemptsWithServer(): Promise<ExamAttempt[]> {
  const user = getCurrentUser();
  if (!user) return getExamAttempts();
  
  try {
    const res = await fetch(`/api/attempts?email=${encodeURIComponent(user.email)}`);
    if (res.ok) {
      const serverAttempts = await res.json();
      localStorage.setItem(BASE_ATTEMPTS_KEY + getUserSuffix(), JSON.stringify(serverAttempts));
      return serverAttempts;
    }
  } catch (e) {
    console.error(e);
  }
  return getExamAttempts();
}

export async function saveExamAttempt(attempt: Omit<ExamAttempt, 'id' | 'date'>) {
  try {
    const user = getCurrentUser();
    const payload = {
      ...attempt,
      email: user ? user.email : 'guest@met.com',
      name: user ? user.name : 'Guest User'
    };
    
    // Save locally
    const attempts = getExamAttempts();
    const newAttempt: ExamAttempt = {
      ...attempt,
      id: 'attempt-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    attempts.unshift(newAttempt);
    localStorage.setItem(BASE_ATTEMPTS_KEY + getUserSuffix(), JSON.stringify(attempts));

    // Push to real server database
    await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('Failed to save exam attempt:', e);
  }
}

export function clearExamAttempts() {
  try {
    localStorage.removeItem(BASE_ATTEMPTS_KEY + getUserSuffix());
  } catch (e) {}
}

// 4. Global Leaderboard - Synced with server
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function syncLeaderboardWithServer(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const list = await res.json();
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
      return list;
    }
  } catch (e) {
    console.error("Failed to sync leaderboard with backend database:", e);
  }
  return getLeaderboard();
}

export async function getLeaderboardForSet(setNum: number): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`/api/leaderboard/set/${setNum}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error(e);
  }
  // Fallback
  return getLeaderboard().filter(entry => entry.setNum === setNum);
}

export async function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): Promise<boolean> {
  try {
    const locks = getLocks();
    if (locks.includes(entry.setNum)) {
      return false; // Already submitted score for this set-paper. Locked.
    }

    const payload = {
      ...entry,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Submits to the server
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Local storage locking update
      locks.push(entry.setNum);
      saveLocks(locks);
      await syncLeaderboardWithServer();
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to submit leaderboard entry to server:', e);
    return false;
  }
}

export async function resetLeaderboard() {
  try {
    const res = await fetch('/api/leaderboard/reset', { method: 'POST' });
    if (res.ok) {
      await syncLeaderboardWithServer();
    }
  } catch (e) {}
}

export function getLocks(): number[] {
  try {
    const raw = localStorage.getItem(LOCKS_KEY + getUserSuffix());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocks(locks: number[]) {
  try {
    localStorage.setItem(LOCKS_KEY + getUserSuffix(), JSON.stringify(locks));
  } catch (e) {}
}

export async function adminRemoveLeaderboardEntry(id: string) {
  try {
    await fetch(`/api/leaderboard/${id}`, { method: 'DELETE' });
    await syncLeaderboardWithServer();
  } catch (e) {}
}

export async function adminAddLeaderboardEntry(entry: LeaderboardEntry) {
  try {
    // Directly submit custom score to server database
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    await syncLeaderboardWithServer();
  } catch (e) {}
}
