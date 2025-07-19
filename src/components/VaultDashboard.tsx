import React, { useState, useEffect } from 'react';
import { Plus, FileText, Upload, Shield, Eye, EyeOff, Download, Trash2, LogOut, Search, Filter, X, Tag, Star, BarChart3, Archive, Settings, FolderOpen, Bell, Calendar } from 'lucide-react';
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
import { VaultExport } from './VaultExport';

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
    setSearchTerm: contextSetSearchTerm,
    setSelectedTags,
    toggleNoteFavorite,
    toggleFileFavorite
  } = useVault();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVaultExport, setShowVaultExport] = useState(false);
  const [selectedNote, setSelectedNote] = useState<VaultNote | null>(null);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showBackupConfig, setShowBackupConfig] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<string>(() => 
    localStorage.getItem('vault-backup-frequency') || 'weekly'
  );
  const [backupEnabled, setBackupEnabled] = useState<boolean>(() => 
    localStorage.getItem('vault-backup-enabled') === 'true'
  );

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
    setSelectedNote(note);
    setShowNoteEditor(true);
  };

  const handleTagFilterChange = (tag: string, checked: boolean) => {
    const newTags = checked 
      ? [...state.selectedTags, tag]
      : state.selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Auto-backup reminder functionality
  const setupBackupReminder = () => {
    if (!backupEnabled) return;

    const frequency = backupFrequency;
    const lastBackup = localStorage.getItem('vault-last-backup');
    const now = Date.now();
    
    let intervalMs = 0;
    switch (frequency) {
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case 'monthly':
        intervalMs = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      default:
        intervalMs = 7 * 24 * 60 * 60 * 1000; // Default to weekly
    }

    if (!lastBackup || (now - parseInt(lastBackup)) > intervalMs) {
      // Show reminder
      if (Notification.permission === 'granted') {
        new Notification('SecureCore Backup Reminder', {
          body: `It's time to backup your vault! Last backup was ${lastBackup ? new Date(parseInt(lastBackup)).toLocaleDateString() : 'never'}.`,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const handleBackupConfigSave = () => {
    localStorage.setItem('vault-backup-frequency', backupFrequency);
    localStorage.setItem('vault-backup-enabled', backupEnabled.toString());
    
    if (backupEnabled && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    setShowBackupConfig(false);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Set up backup reminder check on component mount
  useEffect(() => {
    if (backupEnabled) {
      setupBackupReminder();
      // Check every hour for backup reminders
      const interval = setInterval(setupBackupReminder, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [backupEnabled, backupFrequency]);

  const getEncryptionBadge = (encrypted: boolean, type: 'note' | 'file', id: number) => {
    const decrypted = isDecrypted(type, id);
    
    if (!encrypted) {
      return <Badge variant="outline" className="text-warning">Unencrypted</Badge>;
    }
    
    if (decrypted) {
      return <Badge className="decrypted-indicator">Decrypted</Badge>;
    }
    
    return <Badge className="encrypted-indicator">Encrypted</Badge>;
  };

  const renderTagBadges = (tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            <Tag className="w-3 h-3 mr-1" />
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // TODO: Implement import logic
                    console.log('Import backup:', file);
                  }
                }}
              />
              <Button
                onClick={() => setShowVaultExport(true)}
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

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes and files..."
              value={state.searchTerm}
              onChange={(e) => contextSetSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Popover open={showTagFilter} onOpenChange={setShowTagFilter}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="default">
                  <Filter className="w-4 h-4 mr-2" />
                  Tags
                  {state.selectedTags.length > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 text-xs">
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
                        className="h-8 px-2"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {state.allTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tags available</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {state.allTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={state.selectedTags.includes(tag)}
                            onCheckedChange={(checked) => 
                              handleTagFilterChange(tag, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={tag}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              onClick={() => openNoteEditor()}
              className="gap-2 bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white"
            >
              <Plus className="w-4 h-4" />
              New Note
            </Button>
            
            <Button
              onClick={() => setShowFileUpload(true)}
              variant="outline"
              className="gap-2 border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </Button>
          </div>
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

            {/* Tab Content Container */}
            <div className="w-full mt-8">
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
                    <CardContent>
                      {(() => {
                        const filteredNotes = state.notes.filter(note => 
                          note.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                          (note.content && note.content.toLowerCase().includes(state.searchTerm.toLowerCase())) ||
                          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase())))
                        );
                        
                        const filteredFiles = state.files.filter(file => 
                          file.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                          (file.tags && file.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase())))
                        );
                        
                        const totalResults = filteredNotes.length + filteredFiles.length;
                        
                        if (totalResults === 0) {
                          return (
                            <div className="text-center py-8">
                              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">No results found</h3>
                              <p className="text-muted-foreground">Try adjusting your search terms</p>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-6">
                            {filteredNotes.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-tidecloak-blue" />
                                  Notes ({filteredNotes.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {filteredNotes.slice(0, 6).map((note) => {
                                    const decrypted = isDecrypted('note', note.id!);
                                    const content = getDecryptedContent('note', note.id!) as string;
                                    
                                    return (
                                      <Card key={note.id} className="shadow-security animate-secure-fade">
                                        <CardHeader className="pb-3">
                                          <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                                            {getEncryptionBadge(note.encrypted, 'note', note.id!)}
                                          </div>
                                          <CardDescription>
                                            {formatDate(note.updatedAt)}
                                          </CardDescription>
                                          {renderTagBadges(note.tags)}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="min-h-[60px] p-3 bg-muted rounded-md">
                                            {decrypted && content ? (
                                              <p className="text-sm animate-decrypt-reveal">
                                                {content.length > 100 ? `${content.substring(0, 100)}...` : content}
                                              </p>
                                            ) : (
                                              <div className="flex items-center gap-2 text-muted-foreground">
                                                <Shield className="w-4 h-4" />
                                                <span className="text-sm">Content encrypted</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleDecryptNote(note)}
                                              className="flex-1"
                                            >
                                              {decrypted ? (
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
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleEditNote(note)}
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => toggleFavorite('note', note.id!)}
                                            >
                                              <Star className={`w-4 h-4 ${note.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {filteredFiles.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                  <Upload className="w-5 h-5 text-tidecloak-blue" />
                                  Files ({filteredFiles.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {filteredFiles.slice(0, 6).map((file) => {
                                    const decrypted = isDecrypted('file', file.id!);
                                    const content = getDecryptedContent('file', file.id!);
                                    
                                    return (
                                      <Card key={file.id} className="shadow-security animate-secure-fade">
                                        <CardHeader className="pb-3">
                                          <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg truncate">{file.name}</CardTitle>
                                            {getEncryptionBadge(file.encrypted, 'file', file.id!)}
                                          </div>
                                          <CardDescription>
                                            {FileUtils.formatFileSize(file.size)} • {formatDate(file.createdAt)}
                                          </CardDescription>
                                          {renderTagBadges(file.tags)}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="min-h-[60px] p-3 bg-muted rounded-md flex items-center justify-center">
                                            {decrypted && content ? (
                                              <div className="text-center">
                                                <p className="text-sm text-green-600 font-medium">File decrypted</p>
                                                <p className="text-xs text-muted-foreground mt-1">Ready for download</p>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-2 text-muted-foreground">
                                                <Shield className="w-4 h-4" />
                                                <span className="text-sm">File encrypted</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handlePreviewFile(file)}
                                              className="flex-1"
                                            >
                                              {decrypted ? (
                                                <>
                                                  <EyeOff className="w-4 h-4 mr-2" />
                                                  Hide
                                                </>
                                              ) : (
                                                <>
                                                  <Eye className="w-4 h-4 mr-2" />
                                                  Decrypt
                                                </>
                                              )}
                                            </Button>
                                            {decrypted && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => downloadFile(file.id!)}
                                              >
                                                <Download className="w-4 h-4" />
                                              </Button>
                                            )}
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => toggleFavorite('file', file.id!)}
                                            >
                                              <Star className={`w-4 h-4 ${file.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
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
                
                {state.notes.length === 0 ? (
                  <Card className="shadow-security">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
                      <p className="text-muted-foreground mb-4">Create your first encrypted note to get started</p>
                      <Button onClick={() => openNoteEditor()} className="bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Note
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(showFavorites ? state.notes.filter(note => note.favorite) : state.notes).map((note) => {
                      const decrypted = isDecrypted('note', note.id!);
                      const content = getDecryptedContent('note', note.id!) as string;
                      
                      return (
                        <Card key={note.id} className="shadow-security animate-secure-fade">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                              {getEncryptionBadge(note.encrypted, 'note', note.id!)}
                            </div>
                            <CardDescription>
                              {formatDate(note.updatedAt)}
                            </CardDescription>
                            {renderTagBadges(note.tags)}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="min-h-[60px] p-3 bg-muted rounded-md">
                              {decrypted && content ? (
                                <p className="text-sm animate-decrypt-reveal">
                                  {content.length > 100 ? `${content.substring(0, 100)}...` : content}
                                </p>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Shield className="w-4 h-4" />
                                  <span className="text-sm">Content encrypted</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => toggleFavorite('note', note.id!)}
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto"
                              >
                                <Star 
                                  className={`w-4 h-4 ${note.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                                />
                              </Button>
                              <Button
                                onClick={() => handleDecryptNote(note)}
                                className={`flex-1 ${decrypted ? 'bg-tidecloak-green hover:bg-tidecloak-green/90 text-white' : 'bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white'}`}
                                size="sm"
                              >
                                {decrypted ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Decrypt
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
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
                {state.files.length === 0 ? (
                  <Card className="shadow-security">
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
                    {state.files.map((file) => {
                      const decrypted = isDecrypted('file', file.id!);
                      const fileData = getDecryptedContent('file', file.id!) as Uint8Array;
                      
                      return (
                        <Card key={file.id} className="shadow-security animate-secure-fade">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg truncate">{file.name}</CardTitle>
                              {getEncryptionBadge(file.encrypted, 'file', file.id!)}
                            </div>
                            <CardDescription>
                              {FileUtils.formatFileSize(file.size)} • {formatDate(file.updatedAt)}
                            </CardDescription>
                            {renderTagBadges(file.tags)}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="p-3 bg-muted rounded-md">
                              {decrypted && fileData && file.type.startsWith('image/') ? (
                                <div className="text-center">
                                  <img 
                                    src={URL.createObjectURL(new Blob([fileData], { type: file.type }))}
                                    alt={file.name}
                                    className="max-w-full max-h-32 object-contain mx-auto rounded animate-decrypt-reveal"
                                    onLoad={(e) => {
                                      setTimeout(() => {
                                        URL.revokeObjectURL((e.target as HTMLImageElement).src);
                                      }, 100);
                                    }}
                                  />
                                  <p className="text-xs text-muted-foreground mt-2">Preview</p>
                                </div>
                              ) : decrypted ? (
                                <div className="flex items-center gap-2 text-decrypted animate-decrypt-reveal">
                                  <Eye className="w-4 h-4" />
                                  <span className="text-sm">File decrypted - ready to download</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Shield className="w-4 h-4" />
                                  <span className="text-sm">{file.type || 'Unknown file type'}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handlePreviewFile(file)}
                                className={`${decrypted ? 'bg-tidecloak-green hover:bg-tidecloak-green/90 text-white' : 'bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white'}`}
                                size="sm"
                              >
                                {decrypted ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => downloadFile(file.id!)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              <Button
                                onClick={() => deleteFile(file.id!)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
                  <Card className="border-security">
                    <CardHeader>
                      <CardTitle>Vault Settings</CardTitle>
                      <CardDescription>Manage your vault preferences and security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Export Vault Data</h4>
                          <p className="text-sm text-muted-foreground">Create secure backups of your encrypted data</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setShowVaultExport(true);
                            localStorage.setItem('vault-last-backup', Date.now().toString());
                          }}
                          className="border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Import Vault Data</h4>
                          <p className="text-sm text-muted-foreground">Restore data from a previous backup</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('settings-import-backup')?.click()}
                            className="border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10"
                          >
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Import
                          </Button>
                          <input
                            id="settings-import-backup"
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={handleImportFile}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Auto-backup Reminders</h4>
                          <p className="text-sm text-muted-foreground">Get reminded to backup your vault regularly</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowBackupConfig(true)}
                          className="border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10"
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Security Audit</h4>
                          <p className="text-sm text-muted-foreground">Check encryption status and security metrics</p>
                        </div>
                        <Badge className="bg-tidecloak-green/10 text-tidecloak-green border-tidecloak-green">
                          <Shield className="w-3 h-3 mr-1" />
                          All Secure
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
        </Tabs>

        {/* Modals */}
        {showNoteEditor && (
          <NoteEditor
            note={selectedNote}
            onClose={() => {
              setShowNoteEditor(false);
              setSelectedNote(null);
            }}
          />
        )}

        {showFileUpload && (
          <FileUpload
            onClose={() => setShowFileUpload(false)}
          />
        )}

        {showVaultExport && (
          <VaultExport 
            open={showVaultExport} 
            onClose={() => setShowVaultExport(false)} 
          />
        )}

        {/* Backup Configuration Dialog */}
        {showBackupConfig && (
          <Dialog open={showBackupConfig} onOpenChange={setShowBackupConfig}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-tidecloak-blue rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Backup Reminders</DialogTitle>
                    <DialogDescription>
                      Configure automatic backup reminders
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="backup-enabled" className="text-sm font-medium">
                    Enable backup reminders
                  </Label>
                  <Switch
                    id="backup-enabled"
                    checked={backupEnabled}
                    onCheckedChange={setBackupEnabled}
                  />
                </div>

                {backupEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency" className="text-sm font-medium">
                      Reminder frequency
                    </Label>
                    <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                      <SelectTrigger>
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

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setShowBackupConfig(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBackupConfigSave}
                    className="flex-1 bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}