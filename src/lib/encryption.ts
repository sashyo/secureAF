// TideCloak encryption service for secure data vault
import { useTideCloak } from '@tidecloak/react';

export interface EncryptionResult {
  encryptedData: string | Uint8Array;
  success: boolean;
  error?: string;
}

export interface DecryptionResult {
  decryptedData: string | Uint8Array;
  success: boolean;
  error?: string;
}

export class VaultEncryption {
  private doEncrypt: any;
  private doDecrypt: any;
  private authenticated: boolean;

  constructor(doEncrypt: any, doDecrypt: any, authenticated: boolean) {
    this.doEncrypt = doEncrypt;
    this.doDecrypt = doDecrypt;
    this.authenticated = authenticated;
  }

  // Encrypt text content (for notes)
  async encryptText(plaintext: string): Promise<EncryptionResult> {
    try {
      if (!this.authenticated || !this.doEncrypt) {
        return {
          encryptedData: plaintext,
          success: false,
          error: 'Authentication required for encryption'
        };
      }

      // TideCloak encryption expects array of objects with data and tags
      const encryptionArray = await this.doEncrypt([{
        data: plaintext,
        tags: ['vault-note']
      }]);
      
      if (encryptionArray && encryptionArray.length > 0) {
        return {
          encryptedData: JSON.stringify(encryptionArray[0]),
          success: true
        };
      } else {
        return {
          encryptedData: plaintext,
          success: false,
          error: 'Encryption returned empty result'
        };
      }
    } catch (error) {
      console.error('Text encryption failed:', error);
      return {
        encryptedData: plaintext,
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed'
      };
    }
  }

  // Decrypt text content (for notes)
  async decryptText(encryptedText: string): Promise<DecryptionResult> {
    try {
      if (!this.authenticated || !this.doDecrypt) {
        return {
          decryptedData: encryptedText,
          success: false,
          error: 'Authentication required for decryption'
        };
      }

      // Parse the encrypted data
      const encryptedObject = JSON.parse(encryptedText);
      
      // TideCloak decryption expects array of objects with encrypted data and tags
      const decryptionArray = await this.doDecrypt([{
        encrypted: encryptedObject,
        tags: ['vault-note']
      }]);
      
      if (decryptionArray && decryptionArray.length > 0) {
        return {
          decryptedData: decryptionArray[0],
          success: true
        };
      } else {
        return {
          decryptedData: encryptedText,
          success: false,
          error: 'Decryption returned empty result'
        };
      }
    } catch (error) {
      console.error('Text decryption failed:', error);
      return {
        decryptedData: encryptedText,
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      };
    }
  }

  // Encrypt binary data (for files)
  async encryptBinary(data: Uint8Array): Promise<EncryptionResult> {
    try {
      if (!this.authenticated || !this.doEncrypt) {
        return { encryptedData: data, success: false, error: 'Authentication required for encryption' };
      }

      const CHUNK_SIZE = 32 * 1024;  // 32 KB per slice
      const segments: Array<{ data: string; tags: string[] }> = [];

      // 1) Slice into chunks, convert each to a small binary string, then base64‑encode
      for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
        const slice = data.subarray(offset, offset + CHUNK_SIZE);
        let bin = '';
        for (const byte of slice) {
          bin += String.fromCharCode(byte);
        }
        segments.push({
          data: btoa(bin),
          tags: ['vault-file']
        });
      }

      // 2) Encrypt all base64 chunks at once
      const encryptedChunks = await this.doEncrypt(segments);
      if (!encryptedChunks?.length) {
        return { encryptedData: data, success: false, error: 'Binary encryption returned empty result' };
      }

      // 3) Pack the array of encrypted objects into one Uint8Array
      const payload = JSON.stringify(encryptedChunks);
      return {
        encryptedData: new TextEncoder().encode(payload),
        success: true
      };

    } catch (error) {
      console.error('Binary encryption failed:', error);
      return {
        encryptedData: data,
        success: false,
        error: error instanceof Error ? error.message : 'Binary encryption failed'
      };
    }
  }

  // Decrypt binary data (for files)
  async decryptBinary(encryptedData: Uint8Array): Promise<DecryptionResult> {
    try {
      if (!this.authenticated || !this.doDecrypt) {
        return { decryptedData: encryptedData, success: false, error: 'Authentication required for decryption' };
      }

      // 1) Decode and parse the JSON array of encrypted‑chunk objects
      const str = new TextDecoder().decode(encryptedData);
      const encryptedChunks: any[] = JSON.parse(str);

      // 2) Decrypt each chunk
      const decryptInputs = encryptedChunks.map(chunk => ({
        encrypted: chunk,
        tags: ['vault-file']
      }));
      const decryptedChunks: string[] = await this.doDecrypt(decryptInputs);
      if (!decryptedChunks?.length) {
        return { decryptedData: encryptedData, success: false, error: 'Binary decryption returned empty result' };
      }

      // 3) Reassemble full base64 string, atob → Uint8Array
      const fullB64 = decryptedChunks.join('');
      const binStr = atob(fullB64);
      const out = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        out[i] = binStr.charCodeAt(i);
      }

      return { decryptedData: out, success: true };

    } catch (error) {
      console.error('Binary decryption failed:', error);
      return {
        decryptedData: encryptedData,
        success: false,
        error: error instanceof Error ? error.message : 'Binary decryption failed'
      };
    }
  }
}

// Utility functions for file handling
export const FileUtils = {
  // Convert File to Uint8Array
  async fileToUint8Array(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(new Uint8Array(e.target.result as ArrayBuffer));
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsArrayBuffer(file);
    });
  },

  // Convert Uint8Array to Blob for download
  uint8ArrayToBlob(data: Uint8Array, mimeType: string): Blob {
    return new Blob([data], { type: mimeType });
  },

  // Get file extension
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Check if file is image
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
};

// Hook for encryption service
export function useVaultEncryption() {
  const { doEncrypt, doDecrypt, authenticated } = useTideCloak();
  
  const encryptionService = new VaultEncryption(doEncrypt, doDecrypt, authenticated);
  
  return {
    encryptionService,
    isReady: authenticated && !!doEncrypt && !!doDecrypt,
    ...FileUtils
  };
}