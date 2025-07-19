import React, { useState, useEffect } from 'react';
import { Plus, FileText, Upload, Shield, Eye, EyeOff, Download, Trash2, LogOut, Search, Filter, X, Tag, Star, BarChart3, Archive, Settings, FolderOpen, Bell, Calendar, Loader2, Lock } from 'lucide-react';
import { useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useVault } from '@/contexts/VaultContext';
import { VaultNote, VaultFile, VaultStorage } from '@/lib/database';
import { FileUtils } from '@/lib/encryption';
import { NoteEditor } from './NoteEditor';
import { FileUpload } from './FileUpload';
import { VaultStats } from './VaultStats';

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
    getOperationStatus,
    setSearchTerm: contextSetSearchTerm,
    setSelectedTags,
    toggleNoteFavorite,
    toggleFileFavorite
  } = useVault();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'files' | 'settings'>('overview');
  
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVaultExport, setShowVaultExport] = useState(false);
  const [selectedNote, setSelectedNote] = useState<VaultNote | null>(null);
  const [editingNote, setEditingNote] = useState<VaultNote | null>(null);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<string>(() => 
    localStorage.getItem('vault-backup-frequency') || 'weekly'
  );
  const [backupEnabled, setBackupEnabled] = useState<boolean>(() => 
    localStorage.getItem('vault-backup-enabled') === 'true'
  );

  // Hide all decrypted content when switching tabs
  useEffect(() => {
    console.log('Tab changed to:', activeTab, '- hiding all decrypted content');
    
    // Hide all decrypted notes
    state.notes.forEach(note => {
      if (note.id && isDecrypted('note', note.id)) {
        console.log('Hiding decrypted note:', note.id);
        hideNote(note.id);
      }
    });
    
    // Hide all decrypted files
    state.files.forEach(file => {
      if (file.id && isDecrypted('file', file.id)) {
        console.log('Hiding decrypted file:', file.id);
        hideFile(file.id);
      }
    });
  }, [activeTab, state.notes, state.files, isDecrypted, hideNote, hideFile]);

  const toggleFavorite = async (type: 'note' | 'file', id: number) => {
    if (type === 'note') {
      await toggleNoteFavorite(id);
    } else {
      await toggleFileFavorite(id);
    }
  };

  const openNoteEditor = (note?: VaultNote) => {
    setSelectedNote(note || null);
    setShowNoteEditor(true);
  };

  const handleDecryptNote = async (note: VaultNote) => {
    if (!note.id) return;
    
    const isCurrentlyDecrypted = isDecrypted('note', note.id);
    
    if (isCurrentlyDecrypted) {
      hideNote(note.id);
    } else {
      await decryptNote(note.id);
    }
  };

  const handlePreviewFile = async (file: VaultFile) => {
    if (!file.id) return;
    
    const isCurrentlyDecrypted = isDecrypted('file', file.id);
    
    if (isCurrentlyDecrypted) {
      hideFile(file.id);
    } else {
      await decryptFile(file.id);
    }
  };

  const handleEditNote = (note: VaultNote) => {
    setEditingNote(note);
    setShowNoteEditor(true);
  };

  const getEncryptionBadge = (encrypted: boolean, type: 'note' | 'file', id: number) => {
    const decrypted = isDecrypted(type, id);
    const operationStatus = getOperationStatus(type, id);
    
    if (operationStatus) {
      return (
        <Badge variant="outline" className="text-primary animate-pulse">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          {operationStatus === 'decrypting' ? 'Decrypting...' : 'Encrypting...'}
        </Badge>
      );
    }
    
    if (!encrypted) {
      return <Badge variant="outline" className="text-warning">Unencrypted</Badge>;
    }
    
    if (decrypted) {
      return <Badge className="decrypted-indicator">Decrypted</Badge>;
    }
    
    return <Badge className="encrypted-indicator">Encrypted</Badge>;
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const renderTagFilter = (tag: string) => {
    const isSelected = state.selectedTags.includes(tag);
    return (
      <div key={tag} className="flex items-center space-x-2 py-1">
        <Checkbox
          id={tag}
          checked={isSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedTags([...state.selectedTags, tag]);
            } else {
              setSelectedTags(state.selectedTags.filter(t => t !== tag));
            }
          }}
        />
        <label htmlFor={tag} className="text-sm cursor-pointer flex-1">
          {tag}
        </label>
        <Badge variant="outline" className="text-xs">
          {state.allNotes.filter(note => note.tags.includes(tag)).length + 
           state.allFiles.filter(file => file.tags.includes(tag)).length}
        </Badge>
      </div>
    );
  };

  const renderTagList = (tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
            <Tag className="w-3 h-3 mr-1" />
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

  const filteredNotes = state.notes.filter(note => {
    const matchesSearch = !state.searchTerm || 
      note.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredFiles = state.files.filter(file => {
    const matchesSearch = !state.searchTerm || 
      file.name.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleBackupConfigSave = () => {
    localStorage.setItem('vault-backup-frequency', backupFrequency);
    localStorage.setItem('vault-backup-enabled', backupEnabled.toString());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tidecloak-blue rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-foreground">SecureVault</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => document.getElementById('import-backup')?.click()}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button
                onClick={() => setShowVaultExport(true)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Archive className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => logout()}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive border-destructive/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground">Manage your encrypted notes and files</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowNoteEditor(true)}
              className="bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
            <Button
              onClick={() => setShowFileUpload(true)}
              variant="outline"
              className="border-tidecloak-blue/20 text-tidecloak-blue hover:bg-tidecloak-blue/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes and files..."
              value={state.searchTerm}
              onChange={(e) => contextSetSearchTerm(e.target.value)}
              className="pl-10 border-border/50 bg-background/50"
            />
          </div>
          
          <div className="flex gap-2">
            <Popover open={showTagFilter} onOpenChange={setShowTagFilter}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="default" className="border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Tags
                  {state.selectedTags.length > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-tidecloak-blue text-white">
                      {state.selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filter by Tags</h4>
                    {state.selectedTags.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearTagFilters}
                        className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {state.allTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tags available</p>
                    ) : (
                      state.allTags.map(renderTagFilter)
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <input
          id="import-backup"
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              console.log('Import backup:', file);
            }
          }}
        />

        {/* Dashboard Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'notes' | 'files' | 'settings')} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/30 rounded-lg border border-border/50">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md"
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md"
            >
              <FileText className="w-4 h-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md"
            >
              <Upload className="w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              <VaultStats />
              
              {state.searchTerm && (
                <Card className="border-tidecloak-blue/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-tidecloak-blue" />
                      Search Results for "{state.searchTerm}"
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Combined search results */}
                    <div className="grid gap-4">
                      {filteredNotes.slice(0, 3).map((note) => {
                        const decrypted = isDecrypted('note', note.id!);
                        const content = getDecryptedContent('note', note.id!) as string;
                        
                        return (
                          <Card key={note.id} className="border-l-4 border-l-tidecloak-blue">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-tidecloak-blue" />
                                    <h4 className="font-medium">{note.title}</h4>
                                    {getEncryptionBadge(note.encrypted, 'note', note.id!)}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {decrypted ? content : '🔒 Encrypted content - click to decrypt'}
                                  </p>
                                  {renderTagList(note.tags)}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleDecryptNote(note)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    {decrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      
                      {filteredFiles.slice(0, 3).map((file) => {
                        const decrypted = isDecrypted('file', file.id!);
                        
                        return (
                          <Card key={file.id} className="border-l-4 border-l-tidecloak-green">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Upload className="w-4 h-4 text-tidecloak-green" />
                                    <h4 className="font-medium">{file.name}</h4>
                                    {getEncryptionBadge(file.encrypted, 'file', file.id!)}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {file.type} • {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                  {renderTagList(file.tags)}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handlePreviewFile(file)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    {decrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-tidecloak-blue" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p className="text-2xl font-bold">{state.allNotes.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Upload className="h-8 w-8 text-tidecloak-green" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Files</p>
                        <p className="text-2xl font-bold">{state.allFiles.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Tag className="h-8 w-8 text-tidecloak-purple" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Tags</p>
                        <p className="text-2xl font-bold">{state.allTags.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Shield className="h-8 w-8 text-tidecloak-cyan" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Encryption</p>
                        <p className="text-lg font-bold">AES-256</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={showFavorites ? "default" : "outline"}
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={showFavorites ? "bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white" : ""}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Favorites Only
                  </Button>
                </div>
              </div>

              {filteredNotes.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                    <p className="text-muted-foreground mb-4">
                      {state.searchTerm ? 'Try adjusting your search terms' : 'Create your first encrypted note'}
                    </p>
                    <Button onClick={() => setShowNoteEditor(true)} className="bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Note
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(showFavorites ? filteredNotes.filter(note => note.favorite) : filteredNotes).map((note) => {
                    const decrypted = isDecrypted('note', note.id!);
                    const content = getDecryptedContent('note', note.id!) as string;
                    
                    return (
                      <Card key={note.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                                <Button
                                  onClick={() => toggleFavorite('note', note.id!)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6"
                                >
                                  <Star className={`w-4 h-4 ${note.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                </Button>
                              </div>
                              {getEncryptionBadge(note.encrypted, 'note', note.id!)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {decrypted ? content : '🔒 Encrypted content - click to decrypt'}
                            </p>
                            {renderTagList(note.tags)}
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleDecryptNote(note)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                disabled={!!getOperationStatus('note', note.id!)}
                              >
                                {getOperationStatus('note', note.id!) ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {getOperationStatus('note', note.id!) === 'decrypting' ? 'Decrypting...' : 'Processing...'}
                                  </>
                                ) : decrypted ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleEditNote(note)}
                                variant="outline"
                                size="sm"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => deleteNote(note.id!)}
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-6 mt-0">
              {filteredFiles.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No files uploaded</h3>
                    <p className="text-muted-foreground mb-4">Upload your first encrypted file to get started</p>
                    <Button onClick={() => setShowFileUpload(true)} className="bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => {
                    const decrypted = isDecrypted('file', file.id!);
                    
                    return (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg line-clamp-1">{file.name}</CardTitle>
                                <Button
                                  onClick={() => toggleFavorite('file', file.id!)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6"
                                >
                                  <Star className={`w-4 h-4 ${file.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                </Button>
                              </div>
                              {getEncryptionBadge(file.encrypted, 'file', file.id!)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                              <p>Type: {file.type}</p>
                              <p>Size: {(file.size / 1024).toFixed(1)} KB</p>
                              <p>Created: {new Date(file.createdAt).toLocaleDateString()}</p>
                            </div>
                            {renderTagList(file.tags)}
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handlePreviewFile(file)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                disabled={!!getOperationStatus('file', file.id!)}
                              >
                                {getOperationStatus('file', file.id!) ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {getOperationStatus('file', file.id!) === 'decrypting' ? 'Decrypting...' : 'Processing...'}
                                  </>
                                ) : decrypted ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => downloadFile(file.id!)}
                                variant="outline"
                                size="sm"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => deleteFile(file.id!)}
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vault Settings</CardTitle>
                    <CardDescription>Manage your vault preferences and security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="backup-enabled">Automatic Backup</Label>
                        <p className="text-sm text-muted-foreground">Automatically backup your vault data</p>
                      </div>
                      <Switch
                        id="backup-enabled"
                        checked={backupEnabled}
                        onCheckedChange={setBackupEnabled}
                      />
                    </div>
                    
                    {backupEnabled && (
                      <div>
                        <Label htmlFor="backup-frequency">Backup Frequency</Label>
                        <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleBackupConfigSave}
                        className="flex-1 bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white"
                      >
                        Save Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Note Editor Dialog */}
        {showNoteEditor && (
          <NoteEditor
            note={editingNote}
            onClose={() => {
              setShowNoteEditor(false);
              setEditingNote(null);
            }}
          />
        )}

        {/* File Upload Dialog */}
        {showFileUpload && (
          <FileUpload
            onClose={() => setShowFileUpload(false)}
          />
        )}
      </main>
    </div>
  );
}