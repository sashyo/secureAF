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
        return {
          encryptedData: data,
          success: false,
          error: 'Authentication required for encryption'
        };
      }

      // Step 1: Split the input Uint8Array into manageable chunks (~32KB)
      // This prevents stack overflow when calling String.fromCharCode(...array)
      const chunkSize = 32 * 1024; // 32KB chunks to avoid call stack issues
      const chunks: string[] = [];
      
      // Step 2: Convert each chunk to string via String.fromCharCode
      // Process data in chunks to avoid "Maximum call stack size exceeded"
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        // Convert chunk to array first, then spread to fromCharCode
        const chunkString = String.fromCharCode(...Array.from(chunk));
        chunks.push(chunkString);
      }
      
      // Step 3: Concatenate chunk-strings and convert to base64 via btoa
      // Join all chunk strings into one continuous binary string
      const concatenatedString = chunks.join('');
      // Convert the entire binary string to base64 for TideCloak
      const base64Data = btoa(concatenatedString);
      
      // Step 4: Call doEncrypt with the base64 string
      // TideCloak requires string data, so we pass the base64-encoded content
      const encryptionArray = await this.doEncrypt([{
        data: base64Data,
        tags: ['vault-file']
      }]);
      
      if (encryptionArray && encryptionArray.length > 0) {
        // Step 5: Pack the result back into Uint8Array for EncryptionResult
        // Serialize the encrypted payload and encode as Uint8Array for storage
        const encryptedString = JSON.stringify(encryptionArray[0]);
        return {
          encryptedData: new TextEncoder().encode(encryptedString),
          success: true
        };
      } else {
        return {
          encryptedData: data,
          success: false,
          error: 'Binary encryption returned empty result'
        };
      }
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
        return {
          decryptedData: encryptedData,
          success: false,
          error: 'Authentication required for decryption'
        };
      }

      // Convert back to string for decryption
      const encryptedString = new TextDecoder().decode(encryptedData);
      const encryptedObject = JSON.parse(encryptedString);
      
      // TideCloak decryption expects array of objects with encrypted data and tags
      const decryptionArray = await this.doDecrypt([{
        encrypted: encryptedObject,
        tags: ['vault-file']
      }]);
      
      if (decryptionArray && decryptionArray.length > 0) {
        // Convert base64 back to binary
        const base64Data = decryptionArray[0];
        const binaryString = atob(base64Data);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        return {
          decryptedData: uint8Array,
          success: true
        };
      } else {
        return {
          decryptedData: encryptedData,
          success: false,
          error: 'Binary decryption returned empty result'
        };
      }
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