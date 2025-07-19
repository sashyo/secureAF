import React, { useState } from 'react';
import { Upload, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export function SecureImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select a JSON file",
        variant: "destructive"
      });
    }
  };

  const importData = async () => {
    if (!selectedFile) return;

    setImporting(true);
    try {
      // Mock import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Import Successful",
        description: "Data imported successfully"
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Secure Import</h2>
        <p className="text-muted-foreground">
          Import encrypted vault data from a JSON export file
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Imported data will be automatically encrypted and secured using TideCloak.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Import Vault Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="importFile">Select Export File</Label>
            <Input
              id="importFile"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="mt-2"
            />
          </div>

          {selectedFile && (
            <div className="p-3 border rounded-lg">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          <Button 
            onClick={importData} 
            disabled={!selectedFile || importing}
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            {importing ? 'Importing...' : 'Import Securely'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}