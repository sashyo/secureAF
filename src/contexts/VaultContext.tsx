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
  | { type: 'TOGGLE_DECRYPTED'; payload: { type: 'note' | 'file'; id: string } }
  | { type: 'CLEAR_DECRYPTED' };

const initialState: VaultState = {
  notes: [],
  files: [],
  loading: false,
  error: null,
  decryptedItems: new Set()
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
    case 'TOGGLE_DECRYPTED': {
      const key = `${action.payload.type}-${action.payload.id}`;
      const newDecrypted = new Set(state.decryptedItems);
      if (newDecrypted.has(key)) {
        newDecrypted.delete(key);
      } else {
        newDecrypted.add(key);
      }
      return { ...state, decryptedItems: newDecrypted };
    }
    case 'CLEAR_DECRYPTED':
      return { ...state, decryptedItems: new Set() };
    default:
      return state;
  }
}

interface VaultContextType {
  state: VaultState;
  dispatch: React.Dispatch<VaultAction>;
  // Note operations
  createNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: number, title: string, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  decryptNote: (id: number) => Promise<string | null>;
  // File operations
  uploadFile: (file: File) => Promise<void>;
  deleteFile: (id: number) => Promise<void>;
  downloadFile: (id: number) => Promise<void>;
  decryptFile: (id: number) => Promise<Uint8Array | null>;
  // Utility
  isDecrypted: (type: 'note' | 'file', id: number) => boolean;
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

  const refreshData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [notes, files] = await Promise.all([
        VaultStorage.getAllNotes(userId),
        VaultStorage.getAllFiles(userId)
      ]);
      dispatch({ type: 'SET_NOTES', payload: notes });
      dispatch({ type: 'SET_FILES', payload: files });
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

  const createNote = async (title: string, content: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const encryptResult = await encryptionService.encryptText(content);
      
      const note: Omit<VaultNote, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        content: encryptResult.encryptedData as string,
        encrypted: encryptResult.success,
        userId: userId
      };

      const id = await VaultStorage.saveNote(note);
      const savedNote = await VaultStorage.getNote(id);
      
      if (savedNote) {
        dispatch({ type: 'ADD_NOTE', payload: savedNote });
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

  const updateNote = async (id: number, title: string, content: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const encryptResult = await encryptionService.encryptText(content);
      
      await VaultStorage.updateNote(id, {
        title,
        content: encryptResult.encryptedData as string,
        encrypted: encryptResult.success
      });

      const updatedNote = await VaultStorage.getNote(id);
      if (updatedNote) {
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
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
        return note.content;
      }

      const decryptResult = await encryptionService.decryptText(note.content);
      if (decryptResult.success) {
        dispatch({ type: 'TOGGLE_DECRYPTED', payload: { type: 'note', id: id.toString() } });
        return decryptResult.decryptedData as string;
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

  const uploadFile = async (file: File) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const fileData = await fileToUint8Array(file);
      const encryptResult = await encryptionService.encryptBinary(fileData);
      
      const vaultFile: Omit<VaultFile, 'id' | 'createdAt' | 'updatedAt'> = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: encryptResult.encryptedData as Uint8Array,
        encrypted: encryptResult.success,
        userId: userId
      };

      const id = await VaultStorage.saveFile(vaultFile);
      const savedFile = await VaultStorage.getFile(id);
      
      if (savedFile) {
        dispatch({ type: 'ADD_FILE', payload: savedFile });
        toast({
          title: "Success",
          description: `File "${file.name}" uploaded and ${encryptResult.success ? 'encrypted' : 'saved'}.`
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
        return file.data;
      }

      const decryptResult = await encryptionService.decryptBinary(file.data);
      if (decryptResult.success) {
        dispatch({ type: 'TOGGLE_DECRYPTED', payload: { type: 'file', id: id.toString() } });
        return decryptResult.decryptedData as Uint8Array;
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

  const isDecrypted = (type: 'note' | 'file', id: number): boolean => {
    return state.decryptedItems.has(`${type}-${id}`);
  };

  const contextValue: VaultContextType = {
    state,
    dispatch,
    createNote,
    updateNote,
    deleteNote,
    decryptNote,
    uploadFile,
    deleteFile,
    downloadFile,
    decryptFile,
    isDecrypted,
    refreshData
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