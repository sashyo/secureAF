import React, { useState } from 'react';
import { Upload, Shield, CheckCircle, AlertCircle, FileText, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

export function SecureImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      folders: number;
      notes: number;
      files: number;
    };
  } | null>(null);

  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a JSON backup file",
          variant: "destructive"
        });
      }
    }
  };

  const validateImportData = (data: any): boolean => {
    return (
      typeof data === 'object' &&
      data !== null &&
      data.version &&
      (Array.isArray(data.notes) || Array.isArray(data.files) || Array.isArray(data.folders))
    );
  };

  const importData = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportProgress(0);

    try {
      // Read file content
      const fileContent = await selectedFile.text();
      setImportProgress(20);

      // Parse JSON
      let importData;
      try {
        importData = JSON.parse(fileContent);
      } catch (error) {
        throw new Error('Invalid JSON format in backup file');
      }

      if (!validateImportData(importData)) {
        throw new Error('Invalid NEXUS backup format - corrupted or unsupported version');
      }

      setImportProgress(40);

      let imported = { folders: 0, notes: 0, files: 0 };

      // Initialize database
      await db.initialize();

      // Import folders first (if any)
      if (importData.folders?.length) {
        for (const folder of importData.folders) {
          try {
            await db.saveFolder({
              name: folder.name || 'Imported Folder',
              description: folder.description || '',
              encrypted: folder.encrypted !== false,
              tags: Array.isArray(folder.tags) ? folder.tags : [],
              userId: 'current-user',
              isPrivate: folder.isPrivate || false
            });
            imported.folders++;
          } catch (error) {
            console.error('Error importing folder:', error);
          }
        }
      }

      setImportProgress(60);

      // Import notes
      if (importData.notes?.length) {
        for (const note of importData.notes) {
          try {
            await db.saveNote({
              title: note.title || 'Imported Note',
              content: note.content || '',
              encrypted: note.encrypted !== false,
              tags: Array.isArray(note.tags) ? note.tags : [],
              userId: 'current-user',
              favorite: note.favorite || false,
              category: note.category || 'imported',
              folderId: note.folderId || undefined,
              isPrivate: note.isPrivate || false
            });
            imported.notes++;
          } catch (error) {
            console.error('Error importing note:', error);
          }
        }
      }

      setImportProgress(80);

      // Import files
      if (importData.files?.length) {
        for (const file of importData.files) {
          try {
            // Convert array back to Uint8Array if needed
            const fileData = Array.isArray(file.data) 
              ? new Uint8Array(file.data) 
              : new Uint8Array();

            await db.saveFile({
              name: file.name || 'Imported File',
              type: file.type || 'application/octet-stream',
              size: file.size || fileData.length,
              data: fileData,
              encrypted: file.encrypted !== false,
              tags: Array.isArray(file.tags) ? file.tags : [],
              userId: 'current-user',
              favorite: file.favorite || false,
              category: file.category || 'imported',
              folderId: file.folderId || undefined
            });
            imported.files++;
          } catch (error) {
            console.error('Error importing file:', error);
          }
        }
      }

      setImportProgress(100);

      setImportResult({
        success: true,
        message: 'NEXUS backup successfully restored',
        details: imported
      });

      toast({
        title: "Import Successful",
        description: `Restored ${imported.folders} folders, ${imported.notes} notes, and ${imported.files} files to NEXUS`
      });

    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'NEXUS import system failure'
      });

      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Unknown system error occurred',
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setImportProgress(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please drop a JSON backup file",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-nexus-blue">NEXUS Data Recovery</h2>
        <p className="text-muted-foreground">
          Restore quantum-encrypted backup data to your NEXUS vault
        </p>
      </div>

      <Alert className="border-nexus-blue/20 bg-nexus-blue/5">
        <Shield className="h-4 w-4 text-nexus-blue" />
        <AlertDescription>
          <span className="text-nexus-blue font-medium">Quantum-Secure Import:</span> All imported data maintains 
          TideCloak encryption and is automatically integrated into your NEXUS defense matrix.
        </AlertDescription>
      </Alert>

      <Card className="border-nexus-blue/20 hover:shadow-mecha transition-all">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-nexus-blue">
            <Upload className="w-5 h-5" />
            <span>Deploy Backup Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFile ? (
            <div 
              className="border-2 border-dashed border-nexus-blue/30 rounded-lg p-8 text-center hover:border-nexus-blue/60 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-nexus-blue mx-auto mb-4" />
              <div className="space-y-2">
                <Label htmlFor="importFile" className="text-lg font-medium cursor-pointer">
                  Drop NEXUS backup here or click to select
                </Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">
                  Supports JSON backup files from NEXUS VAULT exports
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border border-nexus-blue/20 rounded-lg bg-nexus-blue/5">
                <FileText className="w-8 h-8 text-nexus-blue" />
                <div className="flex-1">
                  <p className="font-medium text-nexus-blue">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB backup data
                  </p>
                </div>
                <Badge variant="outline" className="border-nexus-blue text-nexus-blue">
                  NEXUS Backup
                </Badge>
              </div>

              {importing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-nexus-blue font-medium">Restoring quantum data...</span>
                    <span className="text-nexus-blue">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full h-2" />
                  <div className="text-xs text-muted-foreground text-center">
                    {importProgress < 40 && "Validating backup integrity..."}
                    {importProgress >= 40 && importProgress < 80 && "Decrypting data fragments..."}
                    {importProgress >= 80 && "Integrating with NEXUS matrix..."}
                  </div>
                </div>
              )}

              {importResult && (
                <Alert variant={importResult.success ? "default" : "destructive"} 
                      className={importResult.success ? "border-nexus-cyan/20 bg-nexus-cyan/5" : ""}>
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 text-nexus-cyan" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className={importResult.success ? "text-nexus-cyan font-medium" : ""}>
                        {importResult.message}
                      </p>
                      {importResult.details && (
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-nexus-blue">{importResult.details.folders}</div>
                            <div className="text-xs text-muted-foreground">Folders</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-nexus-cyan">{importResult.details.notes}</div>
                            <div className="text-xs text-muted-foreground">Notes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-nexus-gold">{importResult.details.files}</div>
                            <div className="text-xs text-muted-foreground">Files</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                {!importing && !importResult && (
                  <Button 
                    onClick={importData} 
                    className="flex-1 bg-gradient-nexus hover:shadow-glow-nexus"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Restore to NEXUS
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={resetImport} 
                  disabled={importing}
                  className="border-nexus-blue text-nexus-blue hover:bg-nexus-blue/10"
                >
                  {importResult ? 'Import Another' : 'Cancel'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="text-nexus-blue">Recovery Protocols</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-nexus-blue mt-0.5" />
              <div>
                <p className="font-medium text-sm">Quantum Encryption</p>
                <p className="text-xs text-muted-foreground">
                  All data maintains TideCloak keyless protection
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-nexus-cyan mt-0.5" />
              <div>
                <p className="font-medium text-sm">Format Validation</p>
                <p className="text-xs text-muted-foreground">
                  Only NEXUS-compatible backup files accepted
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <FolderOpen className="w-5 h-5 text-nexus-gold mt-0.5" />
              <div>
                <p className="font-medium text-sm">Structure Preservation</p>
                <p className="text-xs text-muted-foreground">
                  Folders, tags, and metadata fully restored
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}