import Dexie, { Table } from "dexie";

export interface OfflineVitalRecord {
  id?: number;
  consultationId: string;
  syncKey: string;
  sbp: number | null;
  dbp: number | null;
  hr: number | null;
  temp: number | null;
  spo2: number | null;
  bloodSugar: number | null;
  capturedAt: string;
  createdAt: string;
}

class OfflineVitalsDB extends Dexie {
  offline_vitals!: Table<OfflineVitalRecord, number>;

  constructor() {
    super("sanocare_offline_vitals");
    this.version(1).stores({
      offline_vitals: "++id, consultationId, syncKey, createdAt",
    });
  }
}

export const offlineVitalsDb = new OfflineVitalsDB();

export async function queueOfflineVital(record: Omit<OfflineVitalRecord, "id" | "createdAt">) {
  await offlineVitalsDb.offline_vitals.add({
    ...record,
    createdAt: new Date().toISOString(),
  });
}

export async function listOfflineVitals() {
  return offlineVitalsDb.offline_vitals.orderBy("createdAt").toArray();
}

export async function deleteOfflineVital(id: number) {
  await offlineVitalsDb.offline_vitals.delete(id);
}
