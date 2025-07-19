import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { db, VaultFolder } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

export function FolderManager() {
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      await db.initialize();
      const foldersData = await db.getAllFolders();
      setFolders(foldersData);
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await db.saveFolder({
        name: newFolderName,
        encrypted: true,
        tags: [],
        userId: 'current-user'
      });

      setNewFolderName('');
      setShowCreateFolder(false);
      loadFolders();
      
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Folders</h2>
        
        <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                  Cancel
                </Button>
                <Button onClick={createFolder}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <Card key={folder.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{folder.name}</CardTitle>
                </div>
                {folder.encrypted && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created {new Date(folder.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {folders.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No folders found</h3>
            <p className="text-muted-foreground mb-4">Create your first folder to organize your vault.</p>
            <Button onClick={() => setShowCreateFolder(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}