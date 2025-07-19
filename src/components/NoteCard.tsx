import React, { memo } from 'react';
import { Eye, EyeOff, Star, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VaultNote } from '@/lib/database';
import { EncryptionBadge } from './EncryptionBadge';
import { TagList } from './TagList';
import { formatDate } from '@/lib/dateUtils';

interface NoteCardProps {
  note: VaultNote;
  decrypted: boolean;
  content: string;
  isLoading: boolean;
  onToggleDecrypt: (note: VaultNote) => void;
  onFavorite: (id: number) => void;
  onEdit: (note: VaultNote) => void;
  onDelete: (id: number) => void;
}

export const NoteCard = memo(function NoteCard({
  note,
  decrypted,
  content,
  isLoading,
  onToggleDecrypt,
  onFavorite,
  onEdit,
  onDelete
}: NoteCardProps) {
  return (
    <Card className="shadow-security animate-secure-fade">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate text-lg">{note.title}</CardTitle>
            <CardDescription className="mt-1">
              {formatDate(note.updatedAt)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <EncryptionBadge 
              encrypted={note.encrypted} 
              decrypted={decrypted}
            />
            {note.favorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="p-3 bg-muted/50 rounded-md border border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-tidecloak-blue mr-2" />
            <span className="text-sm text-muted-foreground">
              {decrypted ? 'Hiding...' : 'Decrypting...'}
            </span>
          </div>
        )}
        
        {!isLoading && decrypted && content && (
          <div className="p-3 bg-muted/50 rounded-md border border-dashed border-muted-foreground/30">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {content.length > 150 ? `${content.substring(0, 150)}...` : content}
            </p>
          </div>
        )}
        
        <TagList tags={note.tags || []} />
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleDecrypt(note)}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {decrypted ? 'Hiding...' : 'Decrypting...'}
              </>
            ) : decrypted ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                View
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onFavorite(note.id!)}
            className={`gap-2 ${note.favorite ? 'text-yellow-600 border-yellow-600' : ''}`}
          >
            <Star className={`w-4 h-4 ${note.favorite ? 'fill-current' : ''}`} />
            {note.favorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(note)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(note.id!)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});