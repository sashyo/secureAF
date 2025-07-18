import Dexie, { type Table } from 'dexie';

export interface VaultNote {
  id?: number;
  title: string;
  content: string; // Will be encrypted
  encrypted: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  favorite?: boolean;
  lastAccessed?: Date;
  category?: string;
}

export interface VaultFile {
  id?: number;
  name: string;
  type: string;
  size: number;
  data: Uint8Array; // Will be encrypted
  encrypted: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  favorite?: boolean;
  lastAccessed?: Date;
  category?: string;
}

export class VaultDatabase extends Dexie {
  notes!: Table<VaultNote>;
  files!: Table<VaultFile>;

  constructor() {
    super('SecureDataVault');
    
    this.version(2).stores({
      notes: '++id, title, encrypted, *tags, createdAt, updatedAt, userId',
      files: '++id, name, type, size, encrypted, *tags, createdAt, updatedAt, userId'
    });
    
    // Handle migrations
    this.version(2).upgrade(tx => {
      // Add tags field to existing records
      tx.table('notes').toCollection().modify(note => {
        if (!note.tags) note.tags = [];
      });
      tx.table('files').toCollection().modify(file => {
        if (!file.tags) file.tags = [];
      });
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

  static async getAllNotes(userId?: string, searchTerm?: string, tags?: string[]): Promise<VaultNote[]> {
    let query = userId ? db.notes.where('userId').equals(userId) : db.notes.toCollection();
    
    if (searchTerm || tags?.length) {
      const allNotes = await query.toArray();
      return allNotes.filter(note => {
        const matchesSearch = !searchTerm || 
          note.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = !tags?.length || 
          tags.some(tag => note.tags?.includes(tag));
        return matchesSearch && matchesTags;
      });
    }
    
    return await query.toArray();
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

  static async getAllFiles(userId?: string, searchTerm?: string, tags?: string[]): Promise<VaultFile[]> {
    let query = userId ? db.files.where('userId').equals(userId) : db.files.toCollection();
    
    if (searchTerm || tags?.length) {
      const allFiles = await query.toArray();
      return allFiles.filter(file => {
        const matchesSearch = !searchTerm || 
          file.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = !tags?.length || 
          tags.some(tag => file.tags?.includes(tag));
        return matchesSearch && matchesTags;
      });
    }
    
    return await query.toArray();
  }

  static async getFile(id: number): Promise<VaultFile | undefined> {
    return await db.files.get(id);
  }

  static async getAllTags(userId?: string): Promise<string[]> {
    const [notes, files] = await Promise.all([
      this.getAllNotes(userId),
      this.getAllFiles(userId)
    ]);
    
    const allTags = new Set<string>();
    notes.forEach(note => note.tags?.forEach(tag => allTags.add(tag)));
    files.forEach(file => file.tags?.forEach(tag => allTags.add(tag)));
    
    return Array.from(allTags).sort();
  }

  static async clearAllData(): Promise<void> {
    await db.notes.clear();
    await db.files.clear();
  }
}