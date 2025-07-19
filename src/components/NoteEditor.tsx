import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useVault } from '@/contexts/VaultContext';
import { VaultNote } from '@/lib/database';

interface NoteEditorProps {
  note?: VaultNote | null;
  onClose: () => void;
}

export function NoteEditor({ note, onClose }: NoteEditorProps) {
  const { createNote, updateNote, decryptNote, state } = useVault();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      
      if (note.encrypted) {
        // Check if content is already decrypted in context
        const decryptedContent = state.decryptedContents.get(`note-${note.id}`);
        if (decryptedContent && typeof decryptedContent === 'string') {
          setContent(decryptedContent);
          setIsDecrypting(false);
        } else {
          // If editing an encrypted note, decrypt it first
          setIsDecrypting(true);
          decryptNote(note.id!).then((decrypted) => {
            if (decrypted) {
              setContent(decrypted);
            } else {
              setContent('Unable to decrypt content');
            }
            setIsDecrypting(false);
          });
        }
      } else {
        setContent(note.content);
        setIsDecrypting(false);
      }
    } else {
      setTitle('');
      setContent('');
      setIsDecrypting(false);
    }
  }, [note?.id, note?.encrypted]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      if (isEditing && note?.id) {
        await updateNote(note.id, title.trim(), content.trim());
      } else {
        await createNote(title.trim(), content.trim());
      }
      onClose();
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tidecloak-blue rounded-lg flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {isEditing ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Modify your encrypted note' : 'Create a new encrypted note'}
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-tidecloak-blue/10 text-tidecloak-blue border-tidecloak-blue">
              <Shield className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              onKeyDown={handleKeyDown}
              className="focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <Label htmlFor="content">Content</Label>
            {isDecrypting ? (
              <div className="flex-1 border rounded-md p-4 bg-muted flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4 animate-spin" />
                  <span>Decrypting content...</span>
                </div>
              </div>
            ) : (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content here..."
                className="flex-1 min-h-[300px] resize-none focus:ring-primary focus:border-primary"
                onKeyDown={handleKeyDown}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-tidecloak-blue" />
            <span>Content will be encrypted automatically</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
              className="border-foreground text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white"
              disabled={loading || !title.trim() || !content.trim() || isDecrypting}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save & Encrypt'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Tip: Press Ctrl+S to save quickly
        </div>
      </DialogContent>
    </Dialog>
  );
}