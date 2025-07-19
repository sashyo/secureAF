import React, { useState, useEffect, useReducer, useCallback, Suspense } from 'react';
import { Plus, Upload, Shield, LogOut, FolderOpen, Archive, Settings, BarChart3, FileText } from 'lucide-react';
import { useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVault } from '@/contexts/VaultContext';
import { VaultNote, VaultFile } from '@/lib/database';
import { VaultStats } from './VaultStats';
import { SearchBar } from './SearchBar';
import { NoteCard } from './NoteCard';
import { FileCard } from './FileCard';
import { BackupConfigDialog } from './BackupConfigDialog';

// Lazy load heavy components
const NoteEditor = React.lazy(() => import('./NoteEditor').then(m => ({ default: m.NoteEditor })));
const FileUpload = React.lazy(() => import('./FileUpload').then(m => ({ default: m.FileUpload })));
const VaultExport = React.lazy(() => import('./VaultExport').then(m => ({ default: m.VaultExport })));

// UI State Management with useReducer
interface UIState {
  showNoteEditor: boolean;
  showFileUpload: boolean;
  showVaultExport: boolean;
  showBackupConfig: boolean;
  selectedNote: VaultNote | null;
  showFavorites: boolean;
}

type UIAction = 
  | { type: 'openEditor'; note?: VaultNote }
  | { type: 'closeEditor' }
  | { type: 'openFileUpload' }
  | { type: 'closeFileUpload' }
  | { type: 'openExport' }
  | { type: 'closeExport' }
  | { type: 'openBackupConfig' }
  | { type: 'closeBackupConfig' }
  | { type: 'toggleFavorites' };

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'openEditor':
      return { ...state, showNoteEditor: true, selectedNote: action.note || null };
    case 'closeEditor':
      return { ...state, showNoteEditor: false, selectedNote: null };
    case 'openFileUpload':
      return { ...state, showFileUpload: true };
    case 'closeFileUpload':
      return { ...state, showFileUpload: false };
    case 'openExport':
      return { ...state, showVaultExport: true };
    case 'closeExport':
      return { ...state, showVaultExport: false };
    case 'openBackupConfig':
      return { ...state, showBackupConfig: true };
    case 'closeBackupConfig':
      return { ...state, showBackupConfig: false };
    case 'toggleFavorites':
      return { ...state, showFavorites: !state.showFavorites };
    default:
      return state;
  }
};

const initialUIState: UIState = {
  showNoteEditor: false,
  showFileUpload: false,
  showVaultExport: false,
  showBackupConfig: false,
  selectedNote: null,
  showFavorites: false,
};

export function VaultDashboard() {
  const { logout } = useTideCloak();
  const { 
    state, 
    deleteNote, 
    deleteFile, 
    downloadFile, 
    decryptNote, 
    decryptFile, 
    hideNote,
    hideFile,
    isDecrypted,
    getDecryptedContent,
    setSearchTerm,
    setSelectedTags,
    toggleNoteFavorite,
    toggleFileFavorite
  } = useVault();
  
  const [uiState, dispatch] = useReducer(uiReducer, initialUIState);
  
  // Backup configuration state
  const [backupFrequency, setBackupFrequency] = useState<string>(() => 
    localStorage.getItem('vault-backup-frequency') || 'weekly'
  );
  const [backupEnabled, setBackupEnabled] = useState<boolean>(() => 
    localStorage.getItem('vault-backup-enabled') === 'true'
  );

  // Memoized handlers
  const handleDecryptNote = useCallback(async (note: VaultNote) => {
    if (!note.id) return;
    
    const isCurrentlyDecrypted = isDecrypted('note', note.id);
    
    if (isCurrentlyDecrypted) {
      hideNote(note.id);
    } else {
      await decryptNote(note.id);
    }
  }, [decryptNote, hideNote, isDecrypted]);

  const handleDecryptFile = useCallback(async (file: VaultFile) => {
    if (!file.id) return;
    
    const isCurrentlyDecrypted = isDecrypted('file', file.id);
    
    if (isCurrentlyDecrypted) {
      hideFile(file.id);
    } else {
      await decryptFile(file.id);
    }
  }, [decryptFile, hideFile, isDecrypted]);

  const toggleFavorite = useCallback(async (type: 'note' | 'file', id: number) => {
    if (type === 'note') {
      await toggleNoteFavorite(id);
    } else {
      await toggleFileFavorite(id);
    }
  }, [toggleNoteFavorite, toggleFileFavorite]);

  const handleTagFilterChange = useCallback((tag: string, checked: boolean) => {
    const newTags = checked 
      ? [...state.selectedTags, tag]
      : state.selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
  }, [state.selectedTags, setSelectedTags]);

  const clearTagFilters = useCallback(() => {
    setSelectedTags([]);
  }, [setSelectedTags]);

  const handleBackupConfigSave = useCallback(() => {
    localStorage.setItem('vault-backup-frequency', backupFrequency);
    localStorage.setItem('vault-backup-enabled', backupEnabled.toString());
    
    if (backupEnabled && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    dispatch({ type: 'closeBackupConfig' });
  }, [backupFrequency, backupEnabled]);

  const handleImportFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          console.log('Import data:', importData);
          // TODO: Implement actual import logic here
          alert('Import functionality coming soon!');
        } catch (error) {
          alert('Invalid backup file format.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Filter notes and files
  const filteredNotes = state.notes.filter(note => {
    if (uiState.showFavorites && !note.favorite) return false;
    return true;
  });

  const filteredFiles = state.files.filter(file => {
    if (uiState.showFavorites && !file.favorite) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-tidecloak-light">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Shield className="w-8 h-8 text-tidecloak-blue" />
                  SecureCore
                </h1>
                <Badge variant="outline" className="px-3 py-1 text-tidecloak-blue border-tidecloak-blue bg-tidecloak-blue/10">
                  <Shield className="w-3 h-3 mr-1" />
                  Secured with Tide
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Your encrypted vault protected by advanced cryptography
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => document.getElementById('import-backup')?.click()}
                variant="outline"
                size="sm"
                className="gap-2 border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10"
              >
                <FolderOpen className="w-4 h-4" />
                Import Backup
              </Button>
              <input
                id="import-backup"
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
              <Button
                onClick={() => dispatch({ type: 'openExport' })}
                variant="outline"
                size="sm"
                className="gap-2 border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10"
              >
                <Archive className="w-4 h-4" />
                Export Backup
              </Button>
              <Button
                onClick={() => logout()}
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchTerm={state.searchTerm}
          onSearchChange={setSearchTerm}
          allTags={state.allTags}
          selectedTags={state.selectedTags}
          onTagFilterChange={handleTagFilterChange}
          onClearTagFilters={clearTagFilters}
        />

        {/* Action Buttons */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => dispatch({ type: 'openEditor' })}
            className="gap-2 bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
          
          <Button
            onClick={() => dispatch({ type: 'openFileUpload' })}
            variant="outline"
            className="gap-2 border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-muted rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <FileText className="w-4 h-4" />
              Notes
              <Badge variant="secondary" className="text-xs">
                {state.allNotes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <Upload className="w-4 h-4" />
              Files
              <Badge variant="secondary" className="text-xs">
                {state.allFiles.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-8">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <VaultStats />
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Notes</h2>
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'toggleFavorites' })}
                  className={uiState.showFavorites ? 'bg-yellow-100 text-yellow-800' : ''}
                >
                  {uiState.showFavorites ? 'Show All' : 'Show Favorites'}
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    decrypted={isDecrypted('note', note.id!)}
                    content={(getDecryptedContent('note', note.id!) as string) || ''}
                    onToggleDecrypt={handleDecryptNote}
                    onFavorite={(id) => toggleFavorite('note', id)}
                    onEdit={(note) => dispatch({ type: 'openEditor', note })}
                    onDelete={deleteNote}
                  />
                ))}
              </div>
              
              {filteredNotes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {uiState.showFavorites ? 'No favorite notes found' : 'No notes found'}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Files</h2>
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'toggleFavorites' })}
                  className={uiState.showFavorites ? 'bg-yellow-100 text-yellow-800' : ''}
                >
                  {uiState.showFavorites ? 'Show All' : 'Show Favorites'}
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    decrypted={isDecrypted('file', file.id!)}
                    content={(getDecryptedContent('file', file.id!) as string) || ''}
                    onToggleDecrypt={handleDecryptFile}
                    onFavorite={(id) => toggleFavorite('file', id)}
                    onDownload={downloadFile}
                    onDelete={deleteFile}
                  />
                ))}
              </div>
              
              {filteredFiles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {uiState.showFavorites ? 'No favorite files found' : 'No files found'}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-0">
              <h2 className="text-2xl font-bold">Settings</h2>
              
              <div className="grid gap-4">
                <Button
                  onClick={() => dispatch({ type: 'openExport' })}
                  variant="outline"
                  className="justify-start gap-2 h-auto p-4"
                >
                  <Archive className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Export Vault Data</div>
                    <div className="text-sm text-muted-foreground">
                      Create a backup of your encrypted vault
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => document.getElementById('import-backup')?.click()}
                  variant="outline"
                  className="justify-start gap-2 h-auto p-4"
                >
                  <FolderOpen className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Import Vault Data</div>
                    <div className="text-sm text-muted-foreground">
                      Restore from a previous backup
                    </div>
                  </div>
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Lazy-loaded Modals */}
        <Suspense fallback={<div>Loading...</div>}>
          {uiState.showNoteEditor && (
            <NoteEditor
              note={uiState.selectedNote}
              onClose={() => dispatch({ type: 'closeEditor' })}
            />
          )}
          
          {uiState.showFileUpload && (
            <FileUpload onClose={() => dispatch({ type: 'closeFileUpload' })} />
          )}
          
          {uiState.showVaultExport && (
            <VaultExport 
              open={uiState.showVaultExport}
              onClose={() => dispatch({ type: 'closeExport' })} 
            />
          )}
        </Suspense>

        {/* Backup Configuration Dialog */}
        <BackupConfigDialog
          open={uiState.showBackupConfig}
          onOpenChange={(open) => dispatch({ type: open ? 'openBackupConfig' : 'closeBackupConfig' })}
          backupEnabled={backupEnabled}
          setBackupEnabled={setBackupEnabled}
          backupFrequency={backupFrequency}
          setBackupFrequency={setBackupFrequency}
          onSave={handleBackupConfigSave}
        />
      </div>
    </div>
  );
}