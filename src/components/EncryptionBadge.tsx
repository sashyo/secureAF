import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';

interface EncryptionBadgeProps {
  encrypted: boolean;
  decrypted: boolean;
}

export const EncryptionBadge = memo(function EncryptionBadge({ 
  encrypted, 
  decrypted 
}: EncryptionBadgeProps) {
  if (!encrypted) {
    return <Badge variant="outline" className="text-warning">Unencrypted</Badge>;
  }
  
  if (decrypted) {
    return <Badge className="decrypted-indicator">Decrypted</Badge>;
  }
  
  return <Badge className="encrypted-indicator">Encrypted</Badge>;
});