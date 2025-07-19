import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Quote, Code, Link, Image, Save, Eye, EyeOff, Lock, Unlock, Timer, Hash, Folder } from 'lucide-react';
import { useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { VaultEncryption } from '@/lib/encryption';
import { VaultDatabase, VaultNote, VaultFolder } from '@/lib/database';

interface RichNoteEditorProps {
  note?: VaultNote;
  onSave: (note: VaultNote) => void;
  onCancel: () => void;
}

export function RichNoteEditor({ note, onSave, onCancel }: RichNoteEditorProps) {
  const { doEncrypt } = useTideCloak();
  const { toast } = useToast();
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const [category, setCategory] = useState(note?.category || '');
  const [folderId, setFolderId] = useState(note?.folderId || '');
  const [isPrivate, setIsPrivate] = useState(note?.isPrivate || false);
  const [selfDestruct, setSelfDestruct] = useState(false);
  const [destructTime, setDestructTime] = useState(30);
  const [isEncrypted, setIsEncrypted] = useState(!!note?.encryptedContent);
  const [decryptedContent, setDecryptedContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadFolders();
    if (note?.encryptedContent) {
      setIsEncrypted(true);
    }
  }, []);

  const loadFolders = async () => {
    try {
      const db = new VaultDatabase();
      await db.initialize();
      const allFolders = await db.getAllFolders();
      setFolders(allFolders);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const encryption = new VaultEncryption();
      await encryption.initialize();

      let encryptedContent = '';
      if (content.trim()) {
        const encryptResult = await encryption.encryptText(content);
        if (!encryptResult.success) {
          throw new Error('Failed to encrypt note content');
        }
        encryptedContent = new TextDecoder().decode(encryptResult.encryptedData);
      }

      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

      const noteData: VaultNote = {
        id: note?.id || crypto.randomUUID(),
        title,
        content: isPrivate ? '' : content, // Only store plain content if not private
        encryptedContent: isPrivate ? encryptedContent : '',
        tags: tagArray,
        category: category || 'general',
        folderId: folderId || null,
        isPrivate,
        favorite: note?.favorite || false,
        createdAt: note?.createdAt || new Date(),
        updatedAt: new Date(),
        lastAccessed: new Date(),
        selfDestruct: selfDestruct ? {
          enabled: true,
          timeMinutes: destructTime,
          triggeredAt: null
        } : undefined
      };

      onSave(noteData);

      toast({
        title: "Note Saved",
        description: `${isPrivate ? 'Encrypted' : 'Plain'} note saved successfully`,
      });

    } catch (error) {
      console.error('Failed to save note:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save note",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEncryption = async () => {
    if (!isEncrypted && content.trim()) {
      // Encrypt current content
      try {
        const encryption = new VaultEncryption();
        await encryption.initialize();
        
        const encryptResult = await encryption.encryptText(content);
        if (encryptResult.success) {
          setDecryptedContent(content);
          setContent('');
          setIsEncrypted(true);
          setIsPrivate(true);
          
          toast({
            title: "Content Encrypted",
            description: "Note content is now encrypted",
          });
        }
      } catch (error) {
        toast({
          title: "Encryption Failed",
          description: "Failed to encrypt content",
          variant: "destructive"
        });
      }
    } else if (isEncrypted && decryptedContent) {
      // Restore decrypted content
      setContent(decryptedContent);
      setDecryptedContent('');
      setIsEncrypted(false);
      setIsPrivate(false);
      
      toast({
        title: "Content Decrypted",
        description: "Note content is now in plain text",
      });
    }
  };

  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {note ? 'Edit Note' : 'New Note'}
          </span>
          <div className="flex items-center gap-2">
            {isEncrypted && (
              <Badge variant="outline" className="bg-encrypted-bg text-encrypted border-encrypted">
                <Lock className="w-3 h-3 mr-1" />
                Encrypted
              </Badge>
            )}
            {selfDestruct && (
              <Badge variant="outline" className="bg-warning-bg text-warning border-warning">
                <Timer className="w-3 h-3 mr-1" />
                Self-Destruct
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Note metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., personal, work, ideas"
            />
          </div>
          
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          
          <div>
            <Label htmlFor="folder">Folder</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No folder</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Security options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="private" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Encrypt this note
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="self-destruct"
              checked={selfDestruct}
              onCheckedChange={setSelfDestruct}
            />
            <Label htmlFor="self-destruct" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Enable self-destruct
            </Label>
          </div>

          {selfDestruct && (
            <div className="ml-6">
              <Label>Destruct after (minutes)</Label>
              <Select value={destructTime.toString()} onValueChange={(value) => setDestructTime(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Editor toolbar */}
        <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertFormatting('**', '**')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertFormatting('*', '*')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertFormatting('`', '`')}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertFormatting('\n- ')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertFormatting('\n1. ')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => insertFormatting('\n> ')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPreview(!isPreview)}
            title="Toggle Preview"
          >
            {isPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          
          {content && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleEncryption}
              title={isEncrypted ? "Decrypt Content" : "Encrypt Content"}
            >
              {isEncrypted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Content area */}
        <div className="space-y-2">
          <Label>Content</Label>
          {isPreview ? (
            <div 
              className="min-h-64 p-4 border rounded-lg bg-background prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
            />
          ) : (
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isEncrypted ? "Content is encrypted. Click unlock to edit." : "Start writing your note..."}
              className="min-h-64 font-mono"
              disabled={isEncrypted}
            />
          )}
          
          {isEncrypted && (
            <div className="p-3 bg-encrypted-bg rounded-lg border border-encrypted">
              <div className="flex items-center gap-2 text-encrypted text-sm">
                <Lock className="w-4 h-4" />
                <span>Content is encrypted and protected</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}