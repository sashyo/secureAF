import React, { useState } from 'react';
import { Plus, FileText, Upload, Shield, Eye, EyeOff, Download, Trash2, LogOut, Search, Filter, X, Tag, Star, BarChart3, Archive, Settings } from 'lucide-react';
import { useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
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
    setSelectedTags
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

  const toggleFavorite = async (type: 'note' | 'file', id: number) => {
    if (type === 'note') {
      const note = state.notes.find(n => n.id === id);
      if (note) {
        const updatedNote = { ...note, favorite: !note.favorite };
        await VaultStorage.updateNote(id, updatedNote);
        // The context will update the state via the effect
      }
    } else {
      const file = state.files.find(f => f.id === id);
      if (file) {
        const updatedFile = { ...file, favorite: !file.favorite };
        await VaultStorage.updateFile(id, updatedFile);
        // The context will update the state via the effect
      }
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="w-4 h-4" />
              Notes ({state.notes.length})
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Upload className="w-4 h-4" />
              Files ({state.files.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <VaultStats />
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="ideas">Ideas</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showFavorites ? "default" : "outline"}
                  onClick={() => setShowFavorites(!showFavorites)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
              </div>
              
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
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
                {state.notes.map((note) => {
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

          <TabsContent value="files" className="space-y-4">
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
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card className="border-security">
                <CardHeader>
                  <CardTitle>Vault Settings</CardTitle>
                  <CardDescription>Manage your vault preferences and security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-backup Reminders</h4>
                      <p className="text-sm text-muted-foreground">Get reminded to backup your vault regularly</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Export Vault Data</h4>
                      <p className="text-sm text-muted-foreground">Create secure backups of your encrypted data</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowVaultExport(true)}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Security Audit</h4>
                      <p className="text-sm text-muted-foreground">Check encryption status and security metrics</p>
                    </div>
                    <Badge className="encrypted-indicator">
                      <Shield className="w-3 h-3 mr-1" />
                      All Secure
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
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
      </div>
    </div>
  );
}