import React from 'react';
import { Shield, Lock, Unlock } from 'lucide-react';
import { useTideCloak, Authenticated, Unauthenticated } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import heroImage from '@/assets/vault-hero.jpg';

export function VaultLogin() {
  const { login, logout, authenticated } = useTideCloak();

  return (
    <div className="min-h-screen bg-gradient-vault flex items-center justify-center p-4 relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-vault" />
      
      <div className="w-full max-w-md relative z-10">
        <Authenticated>
          <Card className="shadow-security animate-secure-fade">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-security rounded-full flex items-center justify-center">
                <Unlock className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Secure Data Vault</CardTitle>
              <CardDescription>Your encrypted data vault is ready</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-decrypted-bg rounded-lg border border-decrypted/20">
                <div className="flex items-center gap-2 text-decrypted">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Authentication Successful</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  End-to-end encryption is active
                </p>
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </Authenticated>

        <Unauthenticated>
          <Card className="shadow-security animate-secure-fade">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-security rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Secure Data Vault</CardTitle>
              <CardDescription>
                Enterprise-grade encryption for your sensitive data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>Zero-knowledge architecture</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Local-first storage</span>
                </div>
              </div>
              
              <div className="p-4 bg-warning-bg rounded-lg border border-warning/20">
                <div className="text-warning text-sm font-medium">
                  Authentication Required
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sign in to access your encrypted vault
                </p>
              </div>

              <Button 
                onClick={login} 
                variant="vault" 
                size="lg" 
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                Secure Sign In
              </Button>
            </CardContent>
          </Card>
        </Unauthenticated>
      </div>
    </div>
  );
}