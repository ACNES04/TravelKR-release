import type { AuthUser, AuthCredentials, AuthRegisterData } from '@/types/auth';

const USERS_STORAGE_KEY = 'travelkr_users';
const CURRENT_USER_KEY = 'travelkr_current_user';

interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;
}

function isClient() {
  return typeof window !== 'undefined';
}

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getStoredUsers(): StoredUser[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  if (!isClient()) return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function setCurrentUser(user: AuthUser | null) {
  if (!isClient()) return;
  if (user) {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): AuthUser | null {
  if (!isClient()) return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function register(data: AuthRegisterData) {
  const users = getStoredUsers();
  const email = data.email.trim().toLowerCase();
  if (!email || !data.name.trim() || !data.password) {
    throw new Error('입력값을 모두 채워주세요.');
  }

  if (users.some((user) => user.email === email)) {
    throw new Error('이미 등록된 이메일입니다.');
  }

  const passwordHash = await hashPassword(data.password);
  users.push({ name: data.name.trim(), email, passwordHash });
  saveStoredUsers(users);

  const user = { name: data.name.trim(), email };
  setCurrentUser(user);
  return user;
}

export async function login(credentials: AuthCredentials) {
  const users = getStoredUsers();
  const email = credentials.email.trim().toLowerCase();
  if (!email || !credentials.password) {
    throw new Error('이메일과 비밀번호를 모두 입력해주세요.');
  }

  const passwordHash = await hashPassword(credentials.password);
  const matched = users.find((user) => user.email === email && user.passwordHash === passwordHash);
  if (!matched) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const user = { name: matched.name, email: matched.email };
  setCurrentUser(user);
  return user;
}

export function logout() {
  setCurrentUser(null);
}
