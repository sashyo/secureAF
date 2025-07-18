import React, { useState } from 'react';
import { Plus, FileText, Upload, Shield, Eye, EyeOff, Download, Trash2, LogOut } from 'lucide-react';
import { useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useVault } from '@/contexts/VaultContext';
import { VaultNote, VaultFile } from '@/lib/database';
import { FileUtils } from '@/lib/encryption';
import { NoteEditor } from './NoteEditor';
import { FileUpload } from './FileUpload';

export function VaultDashboard() {
  const { logout } = useTideCloak();
  const { state, deleteNote, deleteFile, downloadFile, decryptNote, decryptFile, isDecrypted } = useVault();
  const [selectedNote, setSelectedNote] = useState<VaultNote | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [decryptedContents, setDecryptedContents] = useState<{ [key: string]: string }>({});

  const handleDecryptNote = async (note: VaultNote) => {
    if (!note.id) return;
    
    const isCurrentlyDecrypted = isDecrypted('note', note.id);
    
    if (isCurrentlyDecrypted) {
      // Re-encrypt (hide content)
      const key = `note-${note.id}`;
      const newContents = { ...decryptedContents };
      delete newContents[key];
      setDecryptedContents(newContents);
    } else {
      // Decrypt
      const decrypted = await decryptNote(note.id);
      if (decrypted) {
        setDecryptedContents(prev => ({
          ...prev,
          [`note-${note.id}`]: decrypted
        }));
      }
    }
  };

  const handleEditNote = (note: VaultNote) => {
    setSelectedNote(note);
    setShowNoteEditor(true);
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

  return (
    <div className="min-h-screen bg-gradient-vault">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Secure Data Vault
              </h1>
              <p className="text-muted-foreground mt-1">
                Your encrypted notes and files
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowNoteEditor(true)}
                variant="vault"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
              <Button
                onClick={() => setShowFileUpload(true)}
                variant="secondary"
                size="lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-security">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-2xl font-bold">{state.notes.length}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-security">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Files</p>
                  <p className="text-2xl font-bold">{state.files.length}</p>
                </div>
                <Upload className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-security">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Encrypted Items</p>
                  <p className="text-2xl font-bold">
                    {state.notes.filter(n => n.encrypted).length + state.files.filter(f => f.encrypted).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            {state.notes.length === 0 ? (
              <Card className="shadow-security">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first encrypted note to get started</p>
                  <Button onClick={() => setShowNoteEditor(true)} variant="vault">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.notes.map((note) => {
                  const decrypted = isDecrypted('note', note.id!);
                  const content = decryptedContents[`note-${note.id}`];
                  
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
                            onClick={() => handleDecryptNote(note)}
                            variant={decrypted ? "decrypted" : "encrypted"}
                            size="sm"
                            className="flex-1"
                          >
                            {decrypted ? (
                              <><EyeOff className="w-4 h-4 mr-1" />Hide</>
                            ) : (
                              <><Eye className="w-4 h-4 mr-1" />Decrypt</>
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
                  <Button onClick={() => setShowFileUpload(true)} variant="vault">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.files.map((file) => (
                  <Card key={file.id} className="shadow-security animate-secure-fade">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg truncate">{file.name}</CardTitle>
                        {getEncryptionBadge(file.encrypted, 'file', file.id!)}
                      </div>
                      <CardDescription>
                        {FileUtils.formatFileSize(file.size)} • {formatDate(file.updatedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">{file.type || 'Unknown file type'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadFile(file.id!)}
                          variant="decrypted"
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
                ))}
              </div>
            )}
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
      </div>
    </div>
  );
}