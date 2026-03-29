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

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function readQueue(): Promise<QueueEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueueEntry[];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueueEntry[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export const offlineQueue = {
  async enqueue(
    type: QueueEntry["type"],
    payload: object
  ): Promise<string> {
    const queue = await readQueue();
    const entry: QueueEntry = {
      id: generateUUID(),
      type,
      payload,
      savedAt: new Date().toISOString(),
      attempts: 0,
    };
    queue.push(entry);
    await writeQueue(queue);
    return entry.id;
  },

  async dequeue(id: string): Promise<void> {
    const queue = await readQueue();
    const filtered = queue.filter((entry) => entry.id !== id);
    await writeQueue(filtered);
  },

  async getAll(): Promise<QueueEntry[]> {
    return readQueue();
  },

  async getCount(): Promise<number> {
    const queue = await readQueue();
    return queue.length;
  },

  async markAttempt(id: string, success: boolean): Promise<void> {
    const queue = await readQueue();
    const updated = queue.map((entry) => {
      if (entry.id !== id) return entry;
      return {
        ...entry,
        attempts: entry.attempts + 1,
        lastAttemptAt: new Date().toISOString(),
      };
    });
    await writeQueue(updated);
  },
};
