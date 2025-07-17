import Dexie, { type Table } from 'dexie';

export interface VaultNote {
  id?: number;
  title: string;
  content: string; // Will be encrypted
  encrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface VaultFile {
  id?: number;
  name: string;
  type: string;
  size: number;
  data: Uint8Array; // Will be encrypted
  encrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export class VaultDatabase extends Dexie {
  notes!: Table<VaultNote>;
  files!: Table<VaultFile>;

  constructor() {
    super('SecureDataVault');
    
    this.version(1).stores({
      notes: '++id, title, encrypted, createdAt, updatedAt, userId',
      files: '++id, name, type, size, encrypted, createdAt, updatedAt, userId'
    });
  }
}

export const db = new VaultDatabase();

// Database utility functions
export class VaultStorage {
  static async saveNote(note: Omit<VaultNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    return await db.notes.add({
      ...note,
      createdAt: now,
      updatedAt: now
    });
  }

  static async updateNote(id: number, updates: Partial<VaultNote>): Promise<void> {
    await db.notes.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deleteNote(id: number): Promise<void> {
    await db.notes.delete(id);
  }

  static async getAllNotes(userId?: string): Promise<VaultNote[]> {
    if (userId) {
      return await db.notes.where('userId').equals(userId).toArray();
    }
    return await db.notes.toArray();
  }

  static async getNote(id: number): Promise<VaultNote | undefined> {
    return await db.notes.get(id);
  }

  static async saveFile(file: Omit<VaultFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    return await db.files.add({
      ...file,
      createdAt: now,
      updatedAt: now
    });
  }

  static async updateFile(id: number, updates: Partial<VaultFile>): Promise<void> {
    await db.files.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  }

  static async deleteFile(id: number): Promise<void> {
    await db.files.delete(id);
  }

  static async getAllFiles(userId?: string): Promise<VaultFile[]> {
    if (userId) {
      return await db.files.where('userId').equals(userId).toArray();
    }
    return await db.files.toArray();
  }

  static async getFile(id: number): Promise<VaultFile | undefined> {
    return await db.files.get(id);
  }

  static async clearAllData(): Promise<void> {
    await db.notes.clear();
    await db.files.clear();
  }
}