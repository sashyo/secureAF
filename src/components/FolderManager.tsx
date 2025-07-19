import React, { useState, useEffect } from 'react';
import { Folder, FolderPlus, Edit, Trash2, Lock, Unlock, Users, ChevronRight, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { VaultDatabase, VaultFolder, VaultNote, VaultFile } from '@/lib/database';

interface FolderItem {
  folder: VaultFolder;
  notes: VaultNote[];
  files: VaultFile[];
  subfolders: VaultFolder[];
  isExpanded: boolean;
}

export function FolderManager() {
  const { toast } = useToast();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<VaultFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [newFolderEncrypted, setNewFolderEncrypted] = useState(false);
  const [newFolderParent, setNewFolderParent] = useState<string>('');

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const db = new VaultDatabase();
      await db.initialize();
      
      const allFolders = await db.getAllFolders();
      const allNotes = await db.getAllNotes();
      const allFiles = await db.getAllFiles();

      const folderItems: FolderItem[] = allFolders.map(folder => ({
        folder,
        notes: allNotes.filter(note => note.folderId === folder.id),
        files: allFiles.filter(file => file.folderId === folder.id),
        subfolders: allFolders.filter(f => f.parentId === folder.id),
        isExpanded: false
      }));

      setFolders(folderItems);
    } catch (error) {
      console.error('Failed to load folders:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load folders",
        variant: "destructive"
      });
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a folder name",
        variant: "destructive"
      });
      return;
    }

    try {
      const db = new VaultDatabase();
      await db.initialize();

      const folder: VaultFolder = {
        id: crypto.randomUUID(),
        name: newFolderName,
        description: newFolderDescription,
        color: newFolderColor,
        isEncrypted: newFolderEncrypted,
        parentId: newFolderParent || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canView: true,
          canEdit: true,
          canDelete: true,
          canShare: true
        }
      };

      await db.saveFolder(folder);
      await loadFolders();

      setNewFolderName('');
      setNewFolderDescription('');
      setNewFolderColor('#3B82F6');
      setNewFolderEncrypted(false);
      setNewFolderParent('');
      setIsCreateDialogOpen(false);

      toast({
        title: "Folder Created",
        description: `"${folder.name}" has been created`,
      });

    } catch (error) {
      console.error('Failed to create folder:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  const updateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    try {
      const db = new VaultDatabase();
      await db.initialize();

      const updatedFolder: VaultFolder = {
        ...editingFolder,
        name: newFolderName,
        description: newFolderDescription,
        color: newFolderColor,
        isEncrypted: newFolderEncrypted,
        updatedAt: new Date()
      };

      await db.saveFolder(updatedFolder);
      await loadFolders();

      setEditingFolder(null);
      setNewFolderName('');
      setNewFolderDescription('');
      setNewFolderColor('#3B82F6');
      setNewFolderEncrypted(false);

      toast({
        title: "Folder Updated",
        description: `"${updatedFolder.name}" has been updated`,
      });

    } catch (error) {
      console.error('Failed to update folder:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update folder",
        variant: "destructive"
      });
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const db = new VaultDatabase();
      await db.initialize();

      // Check if folder has items
      const folderItem = folders.find(f => f.folder.id === folderId);
      if (folderItem && (folderItem.notes.length > 0 || folderItem.files.length > 0 || folderItem.subfolders.length > 0)) {
        toast({
          title: "Cannot Delete",
          description: "Folder must be empty before deletion",
          variant: "destructive"
        });
        return;
      }

      await db.deleteFolder(folderId);
      await loadFolders();

      toast({
        title: "Folder Deleted",
        description: "Folder has been deleted",
      });

    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  };

  const toggleExpanded = (folderId: string) => {
    setFolders(prev => prev.map(item => 
      item.folder.id === folderId 
        ? { ...item, isExpanded: !item.isExpanded }
        : item
    ));
  };

  const startEdit = (folder: VaultFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderDescription(folder.description || '');
    setNewFolderColor(folder.color || '#3B82F6');
    setNewFolderEncrypted(folder.isEncrypted || false);
  };

  const cancelEdit = () => {
    setEditingFolder(null);
    setNewFolderName('');
    setNewFolderDescription('');
    setNewFolderColor('#3B82F6');
    setNewFolderEncrypted(false);
  };

  const rootFolders = folders.filter(f => !f.folder.parentId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Folder Management
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Organize your vault items with encrypted folders
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder-name">Name *</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="folder-description">Description</Label>
                  <Input
                    id="folder-description"
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="folder-parent">Parent Folder</Label>
                  <Select value={newFolderParent} onValueChange={setNewFolderParent}>
                    <SelectTrigger>
                      <SelectValue placeholder="None (root level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (root level)</SelectItem>
                      {folders.map(item => (
                        <SelectItem key={item.folder.id} value={item.folder.id}>
                          {item.folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="folder-encrypted"
                    checked={newFolderEncrypted}
                    onCheckedChange={setNewFolderEncrypted}
                  />
                  <Label htmlFor="folder-encrypted">Encrypt folder contents</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createFolder}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Organize and secure your vault items with hierarchical folders
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {rootFolders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No folders created yet</p>
              <p className="text-sm">Create your first folder to organize your vault</p>
            </div>
          ) : (
            rootFolders.map(item => (
              <FolderTreeItem
                key={item.folder.id}
                item={item}
                allFolders={folders}
                onToggleExpanded={toggleExpanded}
                onEdit={startEdit}
                onDelete={deleteFolder}
              />
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingFolder} onOpenChange={(open) => !open && cancelEdit()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Folder</DialogTitle>
              <DialogDescription>
                Update folder settings and permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-folder-name">Name *</Label>
                <Input
                  id="edit-folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-folder-description">Description</Label>
                <Input
                  id="edit-folder-description"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-folder-encrypted"
                  checked={newFolderEncrypted}
                  onCheckedChange={setNewFolderEncrypted}
                />
                <Label htmlFor="edit-folder-encrypted">Encrypt folder contents</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={updateFolder}>
                  Update Folder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface FolderTreeItemProps {
  item: FolderItem;
  allFolders: FolderItem[];
  onToggleExpanded: (folderId: string) => void;
  onEdit: (folder: VaultFolder) => void;
  onDelete: (folderId: string) => void;
  level?: number;
}

function FolderTreeItem({ item, allFolders, onToggleExpanded, onEdit, onDelete, level = 0 }: FolderTreeItemProps) {
  const { folder, notes, files, subfolders, isExpanded } = item;
  const hasChildren = subfolders.length > 0;
  const totalItems = notes.length + files.length;

  return (
    <div className={`${level > 0 ? 'ml-6 border-l border-muted pl-4' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={() => onToggleExpanded(folder.id)}>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className={`${!hasChildren ? 'invisible' : ''}`}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: folder.color || '#3B82F6' }}
              >
                <Folder className="w-4 h-4 text-white" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{folder.name}</span>
                  {folder.isEncrypted && (
                    <Lock className="w-3 h-3 text-encrypted" />
                  )}
                </div>
                {folder.description && (
                  <p className="text-xs text-muted-foreground">{folder.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              {totalItems > 0 && (
                <Badge variant="outline" className="text-xs">
                  {totalItems} items
                </Badge>
              )}
              {subfolders.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {subfolders.length} folders
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(folder)}
              className="opacity-60 hover:opacity-100"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(folder.id)}
              className="opacity-60 hover:opacity-100 text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <CollapsibleContent className="mt-2 space-y-2">
          {/* Show folder contents */}
          {(notes.length > 0 || files.length > 0) && (
            <div className="ml-6 space-y-1">
              {notes.map(note => (
                <div key={note.id} className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{note.title}</span>
                  {note.isPrivate && <Lock className="w-3 h-3 text-encrypted" />}
                </div>
              ))}
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                  <Folder className="w-3 h-3" />
                  <span>{file.name}</span>
                  <Badge variant="outline" className="text-xs">{file.type}</Badge>
                </div>
              ))}
            </div>
          )}
          
          {/* Render subfolders */}
          {subfolders.map(subfolder => {
            const subfolderItem = allFolders.find(f => f.folder.id === subfolder.id);
            if (!subfolderItem) return null;
            
            return (
              <FolderTreeItem
                key={subfolder.id}
                item={subfolderItem}
                allFolders={allFolders}
                onToggleExpanded={onToggleExpanded}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
              />
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}