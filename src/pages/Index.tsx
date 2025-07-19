import React, { useState } from 'react';
import { Shield, FileText, Lock, Upload, Eye, EyeOff, Star, Github, ArrowRight, Cpu, Key, Network } from 'lucide-react';
import { Authenticated, Unauthenticated } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VaultProvider } from '@/contexts/VaultContext';
import { VaultLogin } from '@/components/VaultLogin';
import { VaultDashboard } from '@/components/VaultDashboard';

const SecureVaultLanding = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);

  const handleTryVault = () => {
    // This would trigger the login flow
    setShowDemo(true);
  };

  const handleViewGitHub = () => {
    window.open('https://github.com/tidecloak/secure-vault-demo', '_blank');
  };

  const handleReadDocs = () => {
    window.open('https://docs.tidecloak.com', '_blank');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-tide-dark to-background">
      {/* Hero Section - Vault Focused */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-tide-purple border-tide-purple bg-tide-purple/10">
              <Shield className="w-4 h-4 mr-2" />
              Secured by TideCloak's Keyless Technology
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-hero bg-clip-text text-transparent">SecureVault</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-foreground/90">
              The Data Vault That Can't Be Hacked
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Store your notes, files, and sensitive data with <strong>mathematically unstealable security</strong>. 
              No keys to manage, no keys to steal, no single point of failure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-hero hover:shadow-glow-purple text-lg px-8 py-6" onClick={handleTryVault}>
                <Lock className="w-5 h-5 mr-2" />
                Secure Your Data
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-tide-purple text-tide-purple hover:bg-tide-purple/10 text-lg px-8 py-6" onClick={handleViewGitHub}>
                <Github className="w-5 h-5 mr-2" />
                See the Code
              </Button>
            </div>

            {/* Vault Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <FileText className="w-8 h-8 text-tide-purple mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Encrypted Notes</h3>
                  <p className="text-sm text-muted-foreground">Rich text notes with keyless encryption</p>
                </CardContent>
              </Card>
              
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <Upload className="w-8 h-8 text-decentralized mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Secure Files</h3>
                  <p className="text-sm text-muted-foreground">Upload and store files with unstealable security</p>
                </CardContent>
              </Card>
              
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <Eye className="w-8 h-8 text-unstealable mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Controlled Access</h3>
                  <p className="text-sm text-muted-foreground">Decrypt only when you need it, auto-hide for privacy</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* The TideCloak Revolution */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-tide-purple border-tide-purple bg-tide-purple/10">
                Revolutionary Security
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Why This Vault Can't Be Hacked</h2>
              <p className="text-lg text-muted-foreground">
                This isn't just another encrypted vault. It's secured by TideCloak's breakthrough in cryptography.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-keyless flex items-center justify-center mb-4">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>No Keys Exist</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Traditional encryption creates keys that can be stolen. TideCloak's threshold cryptography means 
                    <strong> the key never exists in full — not even for a second</strong>.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-cyber flex items-center justify-center mb-4">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Fragments Everywhere</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your data is protected by cryptographic fragments distributed across TideCloak's Security Fabric. 
                    <strong> No single point holds enough to decrypt anything</strong>.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center p-8 bg-gradient-hero/10 rounded-lg border border-tide-purple/20">
              <Cpu className="w-12 h-12 text-tide-purple mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">This is What TideCloak Makes Possible</h3>
              <p className="text-muted-foreground mb-6">
                Developers can now build apps with <strong>mathematically unstealable security</strong> 
                without understanding cryptography. This vault is proof — world-class security with simple APIs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-tide-purple text-tide-purple hover:bg-tide-purple/10" onClick={handleReadDocs}>
                  <Github className="w-4 h-4 mr-2" />
                  Explore TideCloak SDK
                </Button>
                <Button variant="outline" className="border-muted hover:bg-muted/10" onClick={handleReadDocs}>
                  <Star className="w-4 h-4 mr-2" />
                  See Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vault Capabilities */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Makes This Vault Special</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beyond just storage — intelligent security features that adapt to how you work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-muted/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-tide-purple" />
                  Smart Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Rich text editor with real-time encryption. Notes auto-hide after viewing for privacy.</p>
                <Badge variant="secondary" className="text-xs">Auto-encrypting</Badge>
              </CardContent>
            </Card>

            <Card className="border-muted/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-decentralized" />
                  File Vault
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Drag & drop file storage with image previews and instant encryption on upload.</p>
                <Badge variant="secondary" className="text-xs">Image preview</Badge>
              </CardContent>
            </Card>

            <Card className="border-muted/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-unstealable" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Complete audit log of all decrypt actions and access patterns for security monitoring.</p>
                <Badge variant="secondary" className="text-xs">Security focused</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Developer CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Experience Unstealable Security</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            See how TideCloak's keyless cryptography makes this vault mathematically impossible to hack. 
            Then imagine what you could build.
          </p>
          
          <Button size="lg" className="bg-gradient-hero hover:shadow-glow-purple text-lg px-8 py-6" onClick={handleTryVault}>
            <Lock className="w-5 h-5 mr-2" />
            Try the Vault
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Demo Modal */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-tide-purple" />
              <span>Try SecureVault</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              To experience the full vault with TideCloak's keyless security, you'll need to authenticate first.
            </p>
            <VaultLogin />
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-muted/20 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-tide-purple mr-2" />
            <span className="font-semibold">SecureVault</span>
            <Badge variant="outline" className="ml-3 text-xs px-2 py-1 text-tide-purple border-tide-purple">
              Powered by TideCloak
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            A demonstration of keyless security. Built for developers who want unstealable data protection.
          </p>
        </div>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <>
      <Unauthenticated>
        <SecureVaultLanding />
      </Unauthenticated>
      
      <Authenticated>
        <VaultProvider>
          <VaultDashboard />
        </VaultProvider>
      </Authenticated>
    </>
  );
};

export default Index;