import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVault } from '@/contexts/VaultContext';
import { FileUtils } from '@/lib/encryption';

interface FileUploadProps {
  onClose: () => void;
}

export function FileUpload({ onClose }: FileUploadProps) {
  const { uploadFile, state } = useVault();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = 50 * 1024 * 1024; // 50MB limit

  const handleFileSelect = (file: File) => {
    if (file.size > maxFileSize) {
      alert('File size must be less than 50MB');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await uploadFile(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Brief delay to show completion
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (FileUtils.isImageFile(file.type)) {
      return <Image className="w-8 h-8 text-primary" />;
    }
    return <File className="w-8 h-8 text-primary" />;
  };

  return (
    <Dialog open={true} onOpenChange={() => !uploading && onClose()}>
      <DialogContent className="max-w-md shadow-security">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-security rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Upload File</DialogTitle>
              <DialogDescription>
                Encrypt and store your file securely
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${dragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drop your file here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 50MB
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-start gap-3">
                  {getFileIcon(selectedFile)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{selectedFile.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {FileUtils.formatFileSize(selectedFile.size)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedFile.type || 'Unknown file type'}
                    </p>
                  </div>
                  {!uploading && (
                    <Button
                      onClick={() => setSelectedFile(null)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {selectedFile.size > maxFileSize && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    File size exceeds 50MB limit
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-encrypted-bg border border-encrypted/20 rounded-md">
                <Shield className="w-4 h-4 text-encrypted" />
                <span className="text-sm text-encrypted font-medium">
                  File will be encrypted before storage
                </span>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Encrypting and uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Badge className="encrypted-indicator">
            <Shield className="w-3 h-3 mr-1" />
            End-to-end encrypted
          </Badge>
          
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              variant="vault"
              disabled={!selectedFile || uploading || selectedFile.size > maxFileSize}
            >
              {uploading ? (
                <>
                  <Shield className="w-4 h-4 mr-2 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Encrypt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}