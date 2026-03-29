import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "@offline_queue";

export interface QueueEntry {
  id: string;
  type: "create-event" | "mark-attendance";
  payload: object;
  savedAt: string;
  attempts: number;
  lastAttemptAt?: string;
}

function generateId(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

async function readQueue(): Promise<QueueEntry[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueueEntry[];
  } catch {
    return [];
  }
}

async function writeQueue(entries: QueueEntry[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
}

export const offlineQueue = {
  async enqueue(
    type: QueueEntry["type"],
    payload: object
  ): Promise<string> {
    const entries = await readQueue();
    const id = generateId();
    const entry: QueueEntry = {
      id,
      type,
      payload,
      savedAt: new Date().toISOString(),
      attempts: 0,
    };
    entries.push(entry);
    await writeQueue(entries);
    return id;
  },

  async dequeue(id: string): Promise<void> {
    const entries = await readQueue();
    await writeQueue(entries.filter((e) => e.id !== id));
  },

  async getAll(): Promise<QueueEntry[]> {
    return readQueue();
  },

  async getCount(): Promise<number> {
    const entries = await readQueue();
    return entries.length;
  },

  async markAttempt(id: string, success: boolean): Promise<void> {
    if (success) {
      await offlineQueue.dequeue(id);
      return;
    }
    const entries = await readQueue();
    const updated = entries.map((e) =>
      e.id === id
        ? { ...e, attempts: e.attempts + 1, lastAttemptAt: new Date().toISOString() }
        : e
    );
    await writeQueue(updated);
  },
};
