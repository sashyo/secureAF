import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Edit3, Tag, Loader2 } from 'lucide-react';
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
  const { createNote, updateNote, decryptNote, state, getOperationStatus } = useVault();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setTags(note.tags || []);
      
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
      setTags([]);
      setIsDecrypting(false);
    }
  }, [note?.id, note?.encrypted]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      if (isEditing && note?.id) {
        await updateNote(note.id, title.trim(), content.trim(), tags);
      } else {
        await createNote(title.trim(), content.trim(), tags);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-premium border-0 bg-card/95 backdrop-blur-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow-primary">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {isEditing ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {isEditing ? 'Modify your encrypted note' : 'Create a new encrypted note'}
                </DialogDescription>
              </div>
            </div>
            <Badge className="encrypted-indicator shadow-glow-primary">
              <Shield className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-hidden">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              onKeyDown={handleKeyDown}
              className="shadow-card border-0 bg-card/50 backdrop-blur-sm focus:shadow-glow-primary transition-all"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags (press Enter)..."
                className="flex-1 shadow-card border-0 bg-card/50 backdrop-blur-sm"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="sm"
                disabled={!tagInput.trim()}
                className="shadow-card border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs shadow-card bg-muted/50">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 flex-1 flex flex-col">
            <Label htmlFor="content" className="text-sm font-medium">Content</Label>
            {isDecrypting ? (
              <div className="flex-1 border rounded-xl p-6 bg-gradient-surface flex items-center justify-center shadow-card">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-tidecloak-blue" />
                  <span className="text-sm font-medium">Decrypting content...</span>
                </div>
              </div>
            ) : (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content here..."
                className="flex-1 min-h-[300px] resize-none shadow-card border-0 bg-card/50 backdrop-blur-sm focus:shadow-glow-primary transition-all"
                onKeyDown={handleKeyDown}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-tidecloak-blue" />
            <span>Content will be encrypted automatically</span>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
              className="shadow-card border-0 bg-muted/50 hover:bg-muted/70 transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-hero hover:bg-gradient-hero/90 text-white shadow-glow-primary hover-lift"
              disabled={loading || !title.trim() || !content.trim() || isDecrypting}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Encrypting & Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Encrypt
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd>
          <span>to save quickly</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}