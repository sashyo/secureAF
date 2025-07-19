import React, { memo } from 'react';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagListProps {
  tags: string[];
}

export const TagList = memo(function TagList({ tags }: TagListProps) {
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
});