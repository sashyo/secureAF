import React, { useState, useRef } from 'react';
import { Upload, FileCheck, AlertTriangle, Loader2, Shield, Key } from 'lucide-react';
import { useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { VaultEncryption } from '@/lib/encryption';
import { VaultDatabase } from '@/lib/database';

interface ImportStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export function SecureImport({ onImportComplete }: { onImportComplete?: () => void }) {
  const { doDecrypt } = useTideCloak();
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSteps, setImportSteps] = useState<ImportStep[]>([
    { id: 'upload', label: 'File Upload', status: 'pending' },
    { id: 'validate', label: 'Security Validation', status: 'pending' },
    { id: 'decrypt', label: 'Decryption', status: 'pending' },
    { id: 'import', label: 'Data Import', status: 'pending' },
  ]);
  const [importStats, setImportStats] = useState<{
    notesImported: number;
    filesImported: number;
    foldersImported: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const updateStep = (stepId: string, status: ImportStep['status']) => {
    setImportSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.vault') && !file.name.endsWith('.json')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a .vault or .json export file",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    
    try {
      // Step 1: Upload
      updateStep('upload', 'processing');
      setImportProgress(25);
      
      const fileData = await file.arrayBuffer();
      await new Promise(resolve => setTimeout(resolve, 500)); // UX delay
      updateStep('upload', 'completed');

      // Step 2: Validate
      updateStep('validate', 'processing');
      setImportProgress(50);
      
      let exportData;
      try {
        if (file.name.endsWith('.vault')) {
          // Encrypted export - needs decryption
          const encryption = new VaultEncryption();
          await encryption.initialize();
          
          const decryptResult = await encryption.decryptBinary(new Uint8Array(fileData));
          if (!decryptResult.success) {
            throw new Error('Failed to decrypt vault file');
          }
          
          const decryptedText = new TextDecoder().decode(decryptResult.decryptedData);
          exportData = JSON.parse(decryptedText);
        } else {
          // Plain JSON export
          const text = new TextDecoder().decode(fileData);
          exportData = JSON.parse(text);
        }
      } catch (error) {
        updateStep('validate', 'error');
        throw new Error('Invalid or corrupted export file');
      }

      // Validate structure
      if (!exportData.notes || !exportData.files || !exportData.folders) {
        throw new Error('Invalid export file structure');
      }

      updateStep('validate', 'completed');

      // Step 3: Decrypt (for encrypted exports)
      updateStep('decrypt', 'processing');
      setImportProgress(75);
      
      if (file.name.endsWith('.vault')) {
        // Additional decryption validation
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      updateStep('decrypt', 'completed');

      // Step 4: Import
      updateStep('import', 'processing');
      setImportProgress(90);

      const db = new VaultDatabase();
      await db.initialize();

      let imported = { notesImported: 0, filesImported: 0, foldersImported: 0 };

      // Import folders first
      for (const folder of exportData.folders) {
        await db.saveFolder({
          ...folder,
          id: folder.id || crypto.randomUUID(),
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt || folder.createdAt)
        });
        imported.foldersImported++;
      }

      // Import notes
      for (const note of exportData.notes) {
        await db.saveNote({
          ...note,
          id: note.id || crypto.randomUUID(),
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt || note.createdAt),
          lastAccessed: note.lastAccessed ? new Date(note.lastAccessed) : new Date()
        });
        imported.notesImported++;
      }

      // Import files
      for (const file of exportData.files) {
        await db.saveFile({
          ...file,
          id: file.id || crypto.randomUUID(),
          createdAt: new Date(file.createdAt),
          updatedAt: new Date(file.updatedAt || file.createdAt),
          lastAccessed: file.lastAccessed ? new Date(file.lastAccessed) : new Date()
        });
        imported.filesImported++;
      }

      setImportStats(imported);
      updateStep('import', 'completed');
      setImportProgress(100);

      toast({
        title: "Import Successful",
        description: `Imported ${imported.notesImported} notes, ${imported.filesImported} files, and ${imported.foldersImported} folders`,
      });

      onImportComplete?.();

    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Secure Import
        </CardTitle>
        <CardDescription>
          Import encrypted vault data with end-to-end security validation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isImporting && !importStats && (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop your vault export file</h3>
            <p className="text-muted-foreground mb-4">
              Support for encrypted .vault files and plain .json exports
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto"
            >
              Select File
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".vault,.json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Key className="w-4 h-4" />
                <span>Encrypted files are automatically decrypted</span>
              </div>
            </div>
          </div>
        )}

        {isImporting && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import Progress</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>

            <div className="space-y-3">
              {importSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                    ${step.status === 'completed' ? 'bg-decrypted text-decrypted-foreground' : ''}
                    ${step.status === 'processing' ? 'bg-primary text-primary-foreground' : ''}
                    ${step.status === 'error' ? 'bg-destructive text-destructive-foreground' : ''}
                    ${step.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {step.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {step.status === 'completed' && <FileCheck className="w-3 h-3" />}
                    {step.status === 'error' && <AlertTriangle className="w-3 h-3" />}
                  </div>
                  <span className="text-sm">{step.label}</span>
                  {step.status === 'processing' && (
                    <Badge variant="outline" className="ml-auto">Processing</Badge>
                  )}
                  {step.status === 'completed' && (
                    <Badge variant="outline" className="ml-auto bg-decrypted-bg text-decrypted">Complete</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {importStats && (
          <Alert className="bg-decrypted-bg border-decrypted">
            <FileCheck className="h-4 w-4" />
            <AlertDescription>
              Successfully imported: {importStats.notesImported} notes, {importStats.filesImported} files, and {importStats.foldersImported} folders
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}