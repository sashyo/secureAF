import React, { memo, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebouncedValue } from '@/hooks/useDebounce';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  allTags: string[];
  selectedTags: string[];
  onTagFilterChange: (tag: string, checked: boolean) => void;
  onClearTagFilters: () => void;
}

export const SearchBar = memo(function SearchBar({
  searchTerm,
  onSearchChange,
  allTags,
  selectedTags,
  onTagFilterChange,
  onClearTagFilters
}: SearchBarProps) {
  const [rawSearch, setRawSearch] = useState(searchTerm);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search notes and files..."
          value={rawSearch}
          onChange={(e) => setRawSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Popover open={showTagFilter} onOpenChange={setShowTagFilter}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="default">
            <Filter className="w-4 h-4 mr-2" />
            Tags
            {selectedTags.length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter by Tags</h4>
              {selectedTags.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearTagFilters}
                  className="h-8 px-2"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            {allTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags available</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => 
                        onTagFilterChange(tag, checked as boolean)
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
    </div>
  );
});