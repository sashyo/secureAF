import React from 'react';
import { Shield, FileText, Upload, Star, Clock, HardDrive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVault } from '@/contexts/VaultContext';
import { FileUtils } from '@/lib/encryption';

export function VaultStats() {
  const { state, setSearchTerm, setSelectedTags } = useVault();

  // Use allNotes and allFiles for accurate stats, not filtered data
  const totalNotes = state.allNotes.length;
  const totalFiles = state.allFiles.length;
  const encryptedNotes = state.allNotes.filter(n => n.encrypted).length;
  const encryptedFiles = state.allFiles.filter(f => f.encrypted).length;
  const favoriteItems = state.allNotes.filter(n => n.favorite).length + state.allFiles.filter(f => f.favorite).length;
  
  const totalStorageBytes = state.allFiles.reduce((total, file) => total + file.size, 0);
  const totalStorage = FileUtils.formatFileSize(totalStorageBytes);

  const recentlyAccessed = [
    ...state.allNotes.filter(n => n.lastAccessed).sort((a, b) => 
      new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime()
    ).slice(0, 3).map(n => ({ type: 'note' as const, item: n })),
    ...state.allFiles.filter(f => f.lastAccessed).sort((a, b) => 
      new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime()
    ).slice(0, 3).map(f => ({ type: 'file' as const, item: f }))
  ].sort((a, b) => 
    new Date(b.item.lastAccessed!).getTime() - new Date(a.item.lastAccessed!).getTime()
  ).slice(0, 5);

  const stats = [
    {
      title: "Total Notes",
      value: totalNotes,
      description: `${encryptedNotes} encrypted`,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Total Files", 
      value: totalFiles,
      description: `${encryptedFiles} encrypted`,
      icon: Upload,
      color: "text-green-600"
    },
    {
      title: "Favorites",
      value: favoriteItems,
      description: "Starred items",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Storage Used",
      value: totalStorage,
      description: `${totalFiles} files`,
      icon: HardDrive,
      color: "text-purple-600"
    }
  ];


  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="border-muted"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-tidecloak-blue`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Overview */}
      <Card className="border-security">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-encrypted" />
            <CardTitle>Security Overview</CardTitle>
          </div>
          <CardDescription>Your vault's encryption status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Notes Encrypted</span>
                <Badge className="encrypted-indicator">
                  {Math.round((encryptedNotes / Math.max(totalNotes, 1)) * 100)}%
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-encrypted h-2 rounded-full transition-all"
                  style={{ width: `${(encryptedNotes / Math.max(totalNotes, 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Files Encrypted</span>
                <Badge className="encrypted-indicator">
                  {Math.round((encryptedFiles / Math.max(totalFiles, 1)) * 100)}%
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-encrypted h-2 rounded-full transition-all"
                  style={{ width: `${(encryptedFiles / Math.max(totalFiles, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentlyAccessed.length > 0 && (
        <Card className="border-security">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Recently accessed items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyAccessed.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {entry.type === 'note' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Upload className="w-4 h-4 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {entry.type === 'note' ? (entry.item as any).title : (entry.item as any).name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.item.lastAccessed ? 
                          new Date(entry.item.lastAccessed).toLocaleDateString() : 
                          'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                  {entry.item.favorite && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}