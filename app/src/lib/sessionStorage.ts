import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface StoredSession {
  readonly id: string;
  readonly name: string;
  readonly sourceXml: string;
  readonly warnings: readonly string[];
  readonly externalData: readonly { readonly id: string; readonly xml: string }[];
  readonly xlsformSheets: Record<string, readonly Record<string, unknown>[]>;
  readonly updatedAt: number;
}

interface SessionDB extends DBSchema {
  sessions: {
    key: string;
    value: StoredSession;
    indexes: { "by-updated": number };
  };
}

const DB_NAME = "xlsform-debugger-v2";
const DB_VERSION = 1;
const STORE = "sessions" as const;
const LAST_SESSION_KEY = "xlsform-debugger:lastSessionId";

let dbPromise: Promise<IDBPDatabase<SessionDB>> | null = null;

function getDb(): Promise<IDBPDatabase<SessionDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SessionDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: StoredSession): Promise<void> {
  const db = await getDb();
  await db.put(STORE, session);
  localStorage.setItem(LAST_SESSION_KEY, session.id);
}

export async function getSession(id: string): Promise<StoredSession | undefined> {
  const db = await getDb();
  return db.get(STORE, id);
}

export async function listSessions(): Promise<readonly StoredSession[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE, "by-updated");
  return all.reverse(); // newest first
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
  const lastId = localStorage.getItem(LAST_SESSION_KEY);
  if (lastId === id) localStorage.removeItem(LAST_SESSION_KEY);
}

export async function renameSession(id: string, name: string): Promise<void> {
  const db = await getDb();
  const existing = await db.get(STORE, id);
  if (!existing) return;
  await db.put(STORE, { ...existing, name });
}

export function getLastSessionId(): string | null {
  return localStorage.getItem(LAST_SESSION_KEY);
}

/** Generate next unique session name like "Session 1", "Session 2", etc. */
export async function nextSessionName(): Promise<string> {
  const sessions = await listSessions();
  const existingNames = new Set(sessions.map(s => s.name));
  let n = 1;
  while (existingNames.has(`Session ${n}`)) {
    n++;
  }
  return `Session ${n}`;
}
