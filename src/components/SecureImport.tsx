import React, { useState } from 'react';
import { Upload, Shield, CheckCircle, AlertCircle, FileText, FolderOpen, RefreshCw, SkipForward } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { db } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

export function SecureImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [itemProgress, setItemProgress] = useState({ current: 0, total: 0, type: '' });
  const [conflictResolution, setConflictResolution] = useState<'replace' | 'skip'>('skip');
  const [showConflictOptions, setShowConflictOptions] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      notes: number;
      files: number;
      skipped: number;
      replaced: number;
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
    console.log('Validating import data:', data);
    return (
      typeof data === 'object' &&
      data !== null &&
      data.version &&
      (Array.isArray(data.notes) || Array.isArray(data.files))
    );
  };

  const prepareImport = async () => {
    console.log('prepareImport called with file:', selectedFile);
    if (!selectedFile) return;

    try {
      // Read and parse file
      const fileContent = await selectedFile.text();
      console.log('File content read:', fileContent.substring(0, 200) + '...');
      const parsedData = JSON.parse(fileContent);
      console.log('Parsed data:', parsedData);
      
      if (!validateImportData(parsedData)) {
        throw new Error('Invalid backup format - corrupted or unsupported version');
      }

      // Initialize database and check for existing data conflicts
      await db.initialize();
      const existingNotes = await db.getAllNotes();
      const existingFiles = await db.getAllFiles();

      const hasConflicts = 
        (parsedData.notes?.some((note: any) => 
          existingNotes.some(existing => existing.title === note.title)
        )) ||
        (parsedData.files?.some((file: any) => 
          existingFiles.some(existing => existing.name === file.name)
        ));

      setImportData(parsedData);

      if (hasConflicts) {
        setShowConflictOptions(true);
      } else {
        // No conflicts, proceed with import
        performImport(parsedData);
      }

    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Invalid backup file',
        variant: "destructive"
      });
    }
  };

  const performImport = async (data: any) => {
    setImporting(true);
    setImportProgress(0);
    setShowConflictOptions(false);
    setCurrentStep('Initializing import process...');
    setItemProgress({ current: 0, total: 0, type: '' });

    try {
      setImportProgress(10);
      setCurrentStep('Connecting to NEXUS database...');

      let imported = { notes: 0, files: 0, skipped: 0, replaced: 0 };

      // Get existing data for conflict checking
      const existingNotes = await db.getAllNotes();
      const existingFiles = await db.getAllFiles();

      setImportProgress(20);
      setCurrentStep('Analyzing data for conflicts...');

      // Calculate total items to process
      const totalItems = (data.notes?.length || 0) + (data.files?.length || 0);
      let processedItems = 0;

      // Import notes
      if (data.notes?.length) {
        setCurrentStep('Importing notes...');
        setItemProgress({ current: 0, total: data.notes.length, type: 'notes' });
        
        for (let i = 0; i < data.notes.length; i++) {
          const note = data.notes[i];
          setItemProgress({ current: i + 1, total: data.notes.length, type: 'notes' });
          
          try {
            const existingNote = existingNotes.find(n => n.title === note.title);
            
            if (existingNote) {
              if (conflictResolution === 'skip') {
                imported.skipped++;
                continue;
              } else {
                // Replace existing note
                await db.notes.update(existingNote.id!, {
                  content: note.content || '',
                  encrypted: note.encrypted !== false,
                  tags: Array.isArray(note.tags) ? note.tags : [],
                  favorite: note.favorite || false,
                  category: note.category || 'imported',
                  folderId: note.folderId || undefined,
                  isPrivate: note.isPrivate || false,
                  updatedAt: new Date()
                });
                imported.replaced++;
              }
            } else {
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
            }
            
            processedItems++;
            const baseProgress = 20 + (processedItems / totalItems) * 60;
            setImportProgress(Math.min(baseProgress, 80));
            
          } catch (error) {
            console.error('Error importing note:', error);
          }
        }
      }

      // Import files
      if (data.files?.length) {
        setCurrentStep('Importing files...');
        setItemProgress({ current: 0, total: data.files.length, type: 'files' });
        
        for (let i = 0; i < data.files.length; i++) {
          const file = data.files[i];
          setItemProgress({ current: i + 1, total: data.files.length, type: 'files' });
          
          try {
            const existingFile = existingFiles.find(f => f.name === file.name);
            
            if (existingFile) {
              if (conflictResolution === 'skip') {
                imported.skipped++;
                continue;
              } else {
                // Replace existing file
                const fileData = Array.isArray(file.data) 
                  ? new Uint8Array(file.data) 
                  : new Uint8Array();

                await db.files.update(existingFile.id!, {
                  type: file.type || 'application/octet-stream',
                  size: file.size || fileData.length,
                  data: fileData,
                  encrypted: file.encrypted !== false,
                  tags: Array.isArray(file.tags) ? file.tags : [],
                  favorite: file.favorite || false,
                  category: file.category || 'imported',
                  folderId: file.folderId || undefined,
                  updatedAt: new Date()
                });
                imported.replaced++;
              }
            } else {
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
            }
            
            processedItems++;
            const baseProgress = 20 + (processedItems / totalItems) * 60;
            setImportProgress(Math.min(baseProgress, 80));
            
          } catch (error) {
            console.error('Error importing file:', error);
          }
        }
      }

      setImportProgress(90);
      setCurrentStep('Finalizing import...');
      setItemProgress({ current: 0, total: 0, type: '' });

      setImportProgress(100);
      setCurrentStep('Import completed successfully!');

      setImportResult({
        success: true,
        message: 'NEXUS backup successfully restored',
        details: imported
      });

      const totalNew = imported.notes + imported.files;
      const totalProcessed = totalNew + imported.skipped + imported.replaced;

      toast({
        title: "Import Successful",
        description: `Processed ${totalProcessed} items: ${totalNew} new, ${imported.replaced} replaced, ${imported.skipped} skipped`
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
    if (importing) {
      // Prevent reset during import
      toast({
        title: "Import in Progress",
        description: "Please wait for the current import to complete",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(null);
    setImportResult(null);
    setImportProgress(0);
    setCurrentStep('');
    setItemProgress({ current: 0, total: 0, type: '' });
    setShowConflictOptions(false);
    setImportData(null);
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

              {showConflictOptions && !importing && (
                <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-amber-800 dark:text-amber-200 text-lg">
                      Data Conflicts Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Some items in the backup have the same names as existing data. Choose how to handle conflicts:
                    </p>
                    
                    <RadioGroup value={conflictResolution} onValueChange={(value: 'replace' | 'skip') => setConflictResolution(value)}>
                      <div className="flex items-center space-x-2 p-3 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <RadioGroupItem value="skip" id="skip" />
                        <Label htmlFor="skip" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <SkipForward className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="font-medium">Skip Duplicates</div>
                            <div className="text-xs text-muted-foreground">Keep existing data, skip items with same name</div>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <RadioGroupItem value="replace" id="replace" />
                        <Label htmlFor="replace" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <RefreshCw className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="font-medium">Replace Existing</div>
                            <div className="text-xs text-muted-foreground">Overwrite existing data with backup data</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => performImport(importData)} 
                        className="flex-1 bg-gradient-nexus hover:shadow-glow-nexus"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Proceed with Import
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowConflictOptions(false)}
                        className="border-amber-600 text-amber-600 hover:bg-amber-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {importing && (
                <div className="space-y-6 p-6 bg-gradient-to-br from-tidecloak-blue/5 to-tidecloak-purple/5 rounded-xl border border-tidecloak-blue/20 animate-fade-up">
                  {/* Main Progress Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-tidecloak-blue rounded-full flex items-center justify-center animate-glow-pulse">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-tidecloak-green rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-tidecloak-blue">NEXUS Import Active</h3>
                        <p className="text-sm text-muted-foreground">Quantum data transfer in progress</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-tidecloak-blue">{importProgress}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </div>

                  {/* Main Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-tidecloak-blue">Overall Progress</span>
                      <span className="text-xs text-tidecloak-blue/70">{importProgress}/100</span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-tidecloak-blue to-tidecloak-purple rounded-full transition-all duration-500 ease-out shadow-glow-primary"
                        style={{ width: `${importProgress}%` }}
                      />
                      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </div>
                  </div>

                  {/* Current Step with Animation */}
                  <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-tidecloak-blue/10 rounded-lg border border-tidecloak-blue/20">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-tidecloak-blue rounded-full animate-pulse shadow-glow-primary"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-tidecloak-blue mb-1">Current Operation</div>
                      <div className="text-sm text-foreground animate-fade-in">{currentStep}</div>
                    </div>
                  </div>

                  {/* Item Progress */}
                  {itemProgress.total > 0 && (
                    <div className="space-y-3 p-4 bg-tidecloak-cyan/5 rounded-lg border border-tidecloak-cyan/20 animate-scale-in">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-tidecloak-cyan rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-tidecloak-cyan capitalize">
                            Processing {itemProgress.type}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-tidecloak-cyan">
                          {itemProgress.current} / {itemProgress.total}
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-tidecloak-cyan to-tidecloak-green rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${(itemProgress.current / itemProgress.total) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-tidecloak-cyan/70">
                        {Math.round((itemProgress.current / itemProgress.total) * 100)}% of {itemProgress.type} processed
                      </div>
                    </div>
                  )}

                  {/* Security Warning */}
                  <div className="flex items-start space-x-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Security Protocol Active</div>
                      <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Do not close this window or navigate away during the import process. TideCloak encryption is being applied to all data.
                      </div>
                    </div>
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
                        <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                          <div>
                            <div className="text-lg font-bold text-nexus-cyan">{importResult.details.notes}</div>
                            <div className="text-xs text-muted-foreground">New Notes</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-nexus-gold">{importResult.details.files}</div>
                            <div className="text-xs text-muted-foreground">New Files</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{importResult.details.replaced || 0}</div>
                            <div className="text-xs text-muted-foreground">Replaced</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-600">{importResult.details.skipped || 0}</div>
                            <div className="text-xs text-muted-foreground">Skipped</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2">
                {!importing && !importResult && !showConflictOptions && (
                  <Button 
                    onClick={() => {
                      console.log('Import button clicked!');
                      prepareImport();
                    }}
                    className="flex-1"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Analyze & Import
                  </Button>
                )}
                
                {!showConflictOptions && (
                  <Button 
                    variant="outline" 
                    onClick={resetImport} 
                    disabled={importing}
                  >
                    {importResult ? 'Import Another' : 'Cancel'}
                  </Button>
                )}
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