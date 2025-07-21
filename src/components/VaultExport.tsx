import React, { useState } from 'react';
import { Download, Shield, AlertTriangle, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useVault } from '@/contexts/VaultContext';
import { useToast } from '@/hooks/use-toast';

interface VaultExportProps {
  open: boolean;
  onClose: () => void;
}

export function VaultExport({ open, onClose }: VaultExportProps) {
  const { state } = useVault();
  const { toast } = useToast();
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeFiles, setIncludeFiles] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);

      const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        notes: includeNotes ? state.notes : [],
        files: includeFiles ? state.files.map(file => ({
          ...file,
          data: Array.from(file.data) // Convert Uint8Array for JSON serialization
        })) : [],
        metadata: {
          totalNotes: state.notes.length,
          totalFiles: state.files.length,
          encryptedNotes: state.notes.filter(n => n.encrypted).length,
          encryptedFiles: state.files.filter(f => f.encrypted).length
        }
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your vault backup has been downloaded securely."
      });

      onClose();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export vault data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const exportSize = () => {
    let size = 0;
    if (includeNotes) {
      size += JSON.stringify(state.notes).length;
    }
    if (includeFiles) {
      size += state.files.reduce((total, file) => total + file.size, 0);
    }
    return formatBytes(size);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl shadow-security">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-security rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Export Vault Backup</DialogTitle>
              <DialogDescription>
                Create a secure backup of your encrypted vault data
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Options */}
          <Card className="border-security">
            <CardHeader>
              <CardTitle className="text-lg">What to Export</CardTitle>
              <CardDescription>Select the data types to include in your backup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="notes" 
                  checked={includeNotes}
                  onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes ({state.notes.length} items)
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="files" 
                  checked={includeFiles}
                  onCheckedChange={(checked) => setIncludeFiles(checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-600" />
                  <label htmlFor="files" className="text-sm font-medium">
                    Files ({state.files.length} items)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-amber-800">Security Notice</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-amber-700">
              <ul className="space-y-1">
                <li>• Your data remains encrypted in the backup file</li>
                <li>• Store the backup file in a secure location</li>
                <li>• Only import backups from trusted sources</li>
                <li>• This backup includes sensitive encrypted content</li>
              </ul>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Estimated backup size:</p>
              <p className="text-sm text-muted-foreground">
                {includeNotes ? state.notes.length : 0} notes, {includeFiles ? state.files.length : 0} files
              </p>
            </div>
            <Badge className="encrypted-indicator text-lg px-3 py-1">
              <Shield className="w-4 h-4 mr-1" />
              {exportSize()}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Badge className="encrypted-indicator">
            <Shield className="w-3 h-3 mr-1" />
            Encrypted backup
          </Badge>
          
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" disabled={exporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              className="bg-gradient-hero hover:bg-gradient-hero/90 text-white"
              disabled={exporting || (!includeNotes && !includeFiles)}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export Backup"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}