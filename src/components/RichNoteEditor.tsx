import React, { useState } from 'react';
import { Save, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VaultNote } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

interface RichNoteEditorProps {
  note?: VaultNote | null;
  onSave?: (note: VaultNote) => void;
  onClose?: () => void;
}

export function RichNoteEditor({ note, onSave, onClose }: RichNoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const { toast } = useToast();

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a title",
        variant: "destructive"
      });
      return;
    }

    const noteData: VaultNote = {
      ...note,
      title,
      content,
      encrypted: true,
      tags: note?.tags || [],
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave?.(noteData);
    onClose?.();
    
    toast({
      title: "Success",
      description: "Note saved successfully"
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{note ? 'Edit Note' : 'Create Note'}</span>
          <Lock className="w-4 h-4 text-warning" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
          />
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note content..."
            className="min-h-[300px]"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}