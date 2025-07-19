import React, { memo } from 'react';
import { Eye, EyeOff, Star, Download, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VaultFile } from '@/lib/database';
import { EncryptionBadge } from './EncryptionBadge';
import { TagList } from './TagList';
import { formatDate } from '@/lib/dateUtils';

interface FileCardProps {
  file: VaultFile;
  decrypted: boolean;
  content: string;
  isLoading: boolean;
  onToggleDecrypt: (file: VaultFile) => void;
  onFavorite: (id: number) => void;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
}

export const FileCard = memo(function FileCard({
  file,
  decrypted,
  content,
  isLoading,
  onToggleDecrypt,
  onFavorite,
  onDownload,
  onDelete
}: FileCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="shadow-security animate-secure-fade">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate text-lg">{file.name}</CardTitle>
            <CardDescription className="mt-1">
              {formatDate(file.createdAt)} • {formatFileSize(file.size)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <EncryptionBadge 
              encrypted={file.encrypted} 
              decrypted={decrypted}
            />
            {file.favorite && (
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
        
        {!isLoading && decrypted && file.type.startsWith('image/') && content && (
          <div className="p-3 bg-muted/50 rounded-md border border-dashed border-muted-foreground/30">
            <img
              src={content}
              alt={file.name}
              className="max-w-full h-auto max-h-48 rounded object-contain"
            />
          </div>
        )}
        
        <TagList tags={file.tags || []} />
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleDecrypt(file)}
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
                Preview
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onFavorite(file.id!)}
            className={`gap-2 ${file.favorite ? 'text-yellow-600 border-yellow-600' : ''}`}
          >
            <Star className={`w-4 h-4 ${file.favorite ? 'fill-current' : ''}`} />
            {file.favorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(file.id!)}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(file.id!)}
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