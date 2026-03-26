import { openDB, type DBSchema, type IDBPDatabase } from "idb";

const SAVE_HISTORY_DB_NAME = "snow-road-web-save-history";
const SAVE_HISTORY_DB_VERSION = 1;
const SAVE_HISTORY_STORE_NAME = "history";

export interface SaveHistoryEntry {
  id: number;
  createdAt: number;
  saveJson: string;
}

type SaveHistoryEntryDraft = Omit<SaveHistoryEntry, "id">;
type SaveHistoryStoredEntry = SaveHistoryEntryDraft & { id?: number };

interface SaveHistoryDB extends DBSchema {
  history: {
    key: number;
    value: SaveHistoryStoredEntry;
  };
}

let saveHistoryDbPromise: Promise<IDBPDatabase<SaveHistoryDB>> | null = null;

const getSaveHistoryDb = () => {
  if (!saveHistoryDbPromise) {
    saveHistoryDbPromise = openDB<SaveHistoryDB>(
      SAVE_HISTORY_DB_NAME,
      SAVE_HISTORY_DB_VERSION,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(SAVE_HISTORY_STORE_NAME)) {
            db.createObjectStore(SAVE_HISTORY_STORE_NAME, {
              keyPath: "id",
              autoIncrement: true,
            });
          }
        },
      }
    );
  }

  return saveHistoryDbPromise;
};

export const appendSaveHistory = async (saveJson: string) => {
  const db = await getSaveHistoryDb();
  const entry: SaveHistoryEntryDraft = {
    createdAt: Date.now(),
    saveJson,
  };

  await db.add(SAVE_HISTORY_STORE_NAME, entry);
};

export const listSaveHistory = async () => {
  const db = await getSaveHistoryDb();
  const entries = (await db.getAll(SAVE_HISTORY_STORE_NAME)).filter(
    (entry): entry is SaveHistoryEntry => typeof entry.id === "number"
  );

  return entries.sort(
    (left, right) =>
      right.createdAt - left.createdAt || right.id - left.id
  );
};

export const deleteSaveHistory = async (id: number) => {
  const db = await getSaveHistoryDb();
  await db.delete(SAVE_HISTORY_STORE_NAME, id);
};
