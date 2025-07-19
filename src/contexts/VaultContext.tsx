import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { VaultNote, VaultFile, VaultStorage } from '@/lib/database';
import { useVaultEncryption } from '@/lib/encryption';
import { useToast } from '@/hooks/use-toast';
import { useTideCloak } from '@tidecloak/react';

export interface VaultState {
  notes: VaultNote[];
  files: VaultFile[];
  loading: boolean;
  error: string | null;
  decryptedItems: Set<string>; // Track which items are currently decrypted
  decryptedContents: Map<string, string | Uint8Array>; // Store decrypted content temporarily
  searchTerm: string;
  selectedTags: string[];
  allTags: string[];
}

export type VaultAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: VaultNote[] }
  | { type: 'SET_FILES'; payload: VaultFile[] }
  | { type: 'ADD_NOTE'; payload: VaultNote }
  | { type: 'UPDATE_NOTE'; payload: VaultNote }
  | { type: 'DELETE_NOTE'; payload: number }
  | { type: 'ADD_FILE'; payload: VaultFile }
  | { type: 'UPDATE_FILE'; payload: VaultFile }
  | { type: 'DELETE_FILE'; payload: number }
  | { type: 'SET_DECRYPTED_CONTENT'; payload: { key: string; content: string | Uint8Array } }
  | { type: 'REMOVE_DECRYPTED_CONTENT'; payload: string }
  | { type: 'CLEAR_DECRYPTED' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_TAGS'; payload: string[] }
  | { type: 'SET_ALL_TAGS'; payload: string[] };

const initialState: VaultState = {
  notes: [],
  files: [],
  loading: false,
  error: null,
  decryptedItems: new Set(),
  decryptedContents: new Map(),
  searchTerm: '',
  selectedTags: [],
  allTags: []
};

function vaultReducer(state: VaultState, action: VaultAction): VaultState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        )
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload)
      };
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] };
    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.id ? action.payload : file
        )
      };
    case 'DELETE_FILE':
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload)
      };
    case 'SET_DECRYPTED_CONTENT': {
      const newDecrypted = new Set(state.decryptedItems);
      const newContents = new Map(state.decryptedContents);
      newDecrypted.add(action.payload.key);
      newContents.set(action.payload.key, action.payload.content);
      return { ...state, decryptedItems: newDecrypted, decryptedContents: newContents };
    }
    case 'REMOVE_DECRYPTED_CONTENT': {
      const newDecrypted = new Set(state.decryptedItems);
      const newContents = new Map(state.decryptedContents);
      newDecrypted.delete(action.payload);
      newContents.delete(action.payload);
      return { ...state, decryptedItems: newDecrypted, decryptedContents: newContents };
    }
    case 'CLEAR_DECRYPTED':
      return { ...state, decryptedItems: new Set(), decryptedContents: new Map() };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'SET_TAGS':
      return { ...state, selectedTags: action.payload };
    case 'SET_ALL_TAGS':
      return { ...state, allTags: action.payload };
    default:
      return state;
  }
}

interface VaultContextType {
  state: VaultState;
  dispatch: React.Dispatch<VaultAction>;
  // Note operations
  createNote: (title: string, content: string, tags?: string[]) => Promise<void>;
  updateNote: (id: number, title: string, content: string, tags?: string[]) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  decryptNote: (id: number) => Promise<string | null>;
  hideNote: (id: number) => void;
  toggleNoteFavorite: (id: number) => Promise<void>;
  // File operations
  uploadFile: (file: File, tags?: string[]) => Promise<void>;
  deleteFile: (id: number) => Promise<void>;
  downloadFile: (id: number) => Promise<void>;
  decryptFile: (id: number) => Promise<Uint8Array | null>;
  hideFile: (id: number) => void;
  toggleFileFavorite: (id: number) => Promise<void>;
  // Search and filtering
  setSearchTerm: (term: string) => void;
  setSelectedTags: (tags: string[]) => void;
  // Utility
  isDecrypted: (type: 'note' | 'file', id: number) => boolean;
  getDecryptedContent: (type: 'note' | 'file', id: number) => string | Uint8Array | null;
  refreshData: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(vaultReducer, initialState);
  const { encryptionService, isReady, fileToUint8Array, uint8ArrayToBlob } = useVaultEncryption();
  const { toast } = useToast();
  const { authenticated, getValueFromToken } = useTideCloak();
  
  // Get user ID from token
  const userId = authenticated ? getValueFromToken('sub') || 'anonymous' : 'anonymous';

  // Load data on mount and user change
  useEffect(() => {
    if (isReady) {
      refreshData();
    }
  }, [isReady, authenticated, userId]);

  // Clear decrypted content when navigating away (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch({ type: 'CLEAR_DECRYPTED' });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const refreshData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [notes, files, tags] = await Promise.all([
        VaultStorage.getAllNotes(userId, state.searchTerm, state.selectedTags.length ? state.selectedTags : undefined),
        VaultStorage.getAllFiles(userId, state.searchTerm, state.selectedTags.length ? state.selectedTags : undefined),
        VaultStorage.getAllTags(userId)
      ]);
      dispatch({ type: 'SET_NOTES', payload: notes });
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_ALL_TAGS', payload: tags });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createNote = async (title: string, content: string, tags: string[] = []) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const encryptResult = await encryptionService.encryptText(content);
      
      const note: Omit<VaultNote, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        content: encryptResult.encryptedData as string,
        encrypted: encryptResult.success,
        tags,
        userId: userId
      };

      const id = await VaultStorage.saveNote(note);
      const savedNote = await VaultStorage.getNote(id);
      
      if (savedNote) {
        dispatch({ type: 'ADD_NOTE', payload: savedNote });
        refreshData(); // Refresh to update tags
        toast({
          title: "Success",
          description: `Note "${title}" created and ${encryptResult.success ? 'encrypted' : 'saved'}.`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateNote = async (id: number, title: string, content: string, tags: string[] = []) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const encryptResult = await encryptionService.encryptText(content);
      
      await VaultStorage.updateNote(id, {
        title,
        content: encryptResult.encryptedData as string,
        encrypted: encryptResult.success,
        tags
      });

      const updatedNote = await VaultStorage.getNote(id);
      if (updatedNote) {
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
        refreshData(); // Refresh to update tags
        toast({
          title: "Success",
          description: `Note "${title}" updated and ${encryptResult.success ? 'encrypted' : 'saved'}.`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await VaultStorage.deleteNote(id);
      dispatch({ type: 'DELETE_NOTE', payload: id });
      toast({
        title: "Success",
        description: "Note deleted successfully."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const decryptNote = async (id: number): Promise<string | null> => {
    try {
      const note = state.notes.find(n => n.id === id);
      if (!note) return null;

      if (!note.encrypted) {
        const key = `note-${id}`;
        dispatch({ type: 'SET_DECRYPTED_CONTENT', payload: { key, content: note.content } });
        return note.content;
      }

      const decryptResult = await encryptionService.decryptText(note.content);
      if (decryptResult.success) {
        const key = `note-${id}`;
        const content = decryptResult.decryptedData as string;
        dispatch({ type: 'SET_DECRYPTED_CONTENT', payload: { key, content } });
        return content;
      } else {
        toast({
          title: "Decryption Failed",
          description: decryptResult.error || "Failed to decrypt note",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Decryption failed';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const hideNote = (id: number) => {
    const key = `note-${id}`;
    dispatch({ type: 'REMOVE_DECRYPTED_CONTENT', payload: key });
  };

  const uploadFile = async (file: File, tags: string[] = []) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const fileData = await fileToUint8Array(file);
      const encryptResult = await encryptionService.encryptBinary(fileData);
      
      // Only save if encryption succeeded
      if (!encryptResult.success) {
        throw new Error(encryptResult.error || 'Encryption failed - file not saved');
      }
      
      const vaultFile: Omit<VaultFile, 'id' | 'createdAt' | 'updatedAt'> = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: encryptResult.encryptedData as Uint8Array,
        encrypted: true, // Always true since we only save if encryption succeeded
        tags,
        userId: userId
      };

      const id = await VaultStorage.saveFile(vaultFile);
      const savedFile = await VaultStorage.getFile(id);
      
      if (savedFile) {
        dispatch({ type: 'ADD_FILE', payload: savedFile });
        refreshData(); // Refresh to update tags
        toast({
          title: "Success",
          description: `File "${file.name}" uploaded and encrypted successfully.`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteFile = async (id: number) => {
    try {
      await VaultStorage.deleteFile(id);
      dispatch({ type: 'DELETE_FILE', payload: id });
      toast({
        title: "Success",
        description: "File deleted successfully."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const decryptFile = async (id: number): Promise<Uint8Array | null> => {
    try {
      const file = state.files.find(f => f.id === id);
      if (!file) return null;

      if (!file.encrypted) {
        const key = `file-${id}`;
        dispatch({ type: 'SET_DECRYPTED_CONTENT', payload: { key, content: file.data } });
        return file.data;
      }

      const decryptResult = await encryptionService.decryptBinary(file.data);
      if (decryptResult.success) {
        const key = `file-${id}`;
        const content = decryptResult.decryptedData as Uint8Array;
        dispatch({ type: 'SET_DECRYPTED_CONTENT', payload: { key, content } });
        return content;
      } else {
        toast({
          title: "Decryption Failed",
          description: decryptResult.error || "Failed to decrypt file",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Decryption failed';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  const hideFile = (id: number) => {
    const key = `file-${id}`;
    dispatch({ type: 'REMOVE_DECRYPTED_CONTENT', payload: key });
  };

  const downloadFile = async (id: number) => {
    try {
      const file = state.files.find(f => f.id === id);
      if (!file) return;

      let fileData: Uint8Array;
      
      if (file.encrypted) {
        const decrypted = await decryptFile(id);
        if (!decrypted) return;
        fileData = decrypted;
      } else {
        fileData = file.data;
      }

      const blob = uint8ArrayToBlob(fileData, file.type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `File "${file.name}" downloaded.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const setSearchTerm = (term: string) => {
    dispatch({ type: 'SET_SEARCH', payload: term });
    // Refresh data will be called by useEffect watching searchTerm
  };

  const setSelectedTags = (tags: string[]) => {
    dispatch({ type: 'SET_TAGS', payload: tags });
    // Refresh data will be called by useEffect watching selectedTags
  };

  // Refresh data when search term or tags change
  useEffect(() => {
    if (isReady) {
      const timeoutId = setTimeout(() => {
        refreshData();
      }, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [state.searchTerm, state.selectedTags, isReady]);

  const toggleNoteFavorite = async (id: number) => {
    try {
      const note = state.notes.find(n => n.id === id);
      if (!note) return;

      const updatedNote = { ...note, favorite: !note.favorite };
      await VaultStorage.updateNote(id, updatedNote);
      dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
      
      toast({
        title: "Success",
        description: `Note ${updatedNote.favorite ? 'added to' : 'removed from'} favorites.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive"
      });
    }
  };

  const toggleFileFavorite = async (id: number) => {
    try {
      const file = state.files.find(f => f.id === id);
      if (!file) return;

      const updatedFile = { ...file, favorite: !file.favorite };
      await VaultStorage.updateFile(id, updatedFile);
      dispatch({ type: 'UPDATE_FILE', payload: updatedFile });
      
      toast({
        title: "Success",
        description: `File ${updatedFile.favorite ? 'added to' : 'removed from'} favorites.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive"
      });
    }
  };

  const isDecrypted = (type: 'note' | 'file', id: number): boolean => {
    return state.decryptedItems.has(`${type}-${id}`);
  };

  const getDecryptedContent = (type: 'note' | 'file', id: number): string | Uint8Array | null => {
    const key = `${type}-${id}`;
    return state.decryptedContents.get(key) || null;
  };

  const contextValue: VaultContextType = {
    state,
    dispatch,
    createNote,
    updateNote,
    deleteNote,
    decryptNote,
    hideNote,
    uploadFile,
    deleteFile,
    downloadFile,
    decryptFile,
    hideFile,
    setSearchTerm,
    setSelectedTags,
    isDecrypted,
    getDecryptedContent,
    refreshData,
    toggleNoteFavorite,
    toggleFileFavorite
  };

  return (
    <VaultContext.Provider value={contextValue}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}