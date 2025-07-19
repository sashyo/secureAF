import React, { useState } from 'react';
import { Shield, FileText, Lock, Upload, Eye, EyeOff, Star, Github, ArrowRight, Cpu, Key, Network, Zap } from 'lucide-react';
import { Authenticated, Unauthenticated } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VaultProvider } from '@/contexts/VaultContext';
import { VaultLogin } from '@/components/VaultLogin';
import { VaultDashboard } from '@/components/VaultDashboard';

const NexusVaultLanding = () => {
  const [showDemo, setShowDemo] = useState(false);

  const handleTryVault = () => {
    setShowDemo(true);
  };

  const handleViewGitHub = () => {
    window.open('https://github.com/tidecloak/nexus-vault', '_blank');
  };

  const handleReadDocs = () => {
    window.open('https://docs.tidecloak.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-nexus-dark to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-nexus opacity-10"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-nexus-blue border-nexus-blue bg-nexus-blue/10 animate-beam-glow">
              <Zap className="w-4 h-4 mr-2" />
              Powered by TideCloak's Keyless Protocol
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-nexus bg-clip-text text-transparent">NEXUS VAULT</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-foreground/90">
              Next-Gen Mecha Security System
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Deploy your data with <strong className="text-nexus-cyan">unstealable quantum armor</strong>. 
              No keys to breach, no core to target, no single point of system failure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-nexus hover:shadow-glow-nexus text-lg px-8 py-6" onClick={handleTryVault}>
                <Shield className="w-5 h-5 mr-2" />
                Activate NEXUS
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-nexus-blue text-nexus-blue hover:bg-nexus-blue/10 text-lg px-8 py-6" onClick={handleViewGitHub}>
                <Github className="w-5 h-5 mr-2" />
                Access Blueprints
              </Button>
            </div>

            {/* Mech Status Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm hover:shadow-mecha transition-all">
                <CardContent className="pt-6 text-center">
                  <FileText className="w-8 h-8 text-nexus-blue mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-nexus-blue">Quantum Notes</h3>
                  <p className="text-sm text-muted-foreground">Encrypted docs with beam-saber security</p>
                </CardContent>
              </Card>
              
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm hover:shadow-mecha transition-all">
                <CardContent className="pt-6 text-center">
                  <Upload className="w-8 h-8 text-nexus-cyan mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-nexus-cyan">Armored Storage</h3>
                  <p className="text-sm text-muted-foreground">Multi-layer quantum file protection</p>
                </CardContent>
              </Card>
              
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm hover:shadow-mecha transition-all">
                <CardContent className="pt-6 text-center">
                  <Eye className="w-8 h-8 text-nexus-gold mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-nexus-gold">Tactical Access</h3>
                  <p className="text-sm text-muted-foreground">Controlled beam deployment & auto-cloak</p>
                </CardContent>
              </Card>
            </div>

            {/* Mech Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-shield mb-2">0 Keys</div>
                <div className="text-sm text-muted-foreground">Core System Vulnerability</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-nexus-cyan mb-2">100% Quantum</div>
                <div className="text-sm text-muted-foreground">Distributed Defense Grid</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-boost mb-2">∞ Armor</div>
                <div className="text-sm text-muted-foreground">Mathematically Unbreakable</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEXUS System Architecture */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-nexus-red border-nexus-red bg-nexus-red/10">
                SYSTEM CLASSIFIED
              </Badge>
              <h2 className="text-3xl font-bold mb-4">Why NEXUS Can't Be Breached</h2>
              <p className="text-lg text-muted-foreground">
                This isn't just armor plating. NEXUS runs on TideCloak's quantum-grade security matrix.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm hover:shadow-mecha transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-shield flex items-center justify-center mb-4">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-nexus-blue">Zero Core Weakness</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Traditional systems have exploitable cores. NEXUS uses quantum fragmentation - 
                    <strong className="text-nexus-cyan"> the key matrix never assembles, not even in memory</strong>.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-muted/20 bg-card/50 backdrop-blur-sm hover:shadow-mecha transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-boost flex items-center justify-center mb-4">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-nexus-cyan">Distributed Defense</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your data deploys across TideCloak's quantum mesh network. 
                    <strong className="text-nexus-gold"> No single breach point contains enough data fragments</strong> to compromise anything.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center p-8 bg-gradient-nexus/10 rounded-lg border border-nexus-blue/20">
              <Cpu className="w-12 h-12 text-nexus-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">This is What TideCloak Enables</h3>
              <p className="text-muted-foreground mb-6">
                Deploy apps with <strong className="text-nexus-cyan">quantum-grade security matrices</strong> 
                without understanding cryptographic protocols. NEXUS proves it - mech-level protection with simple APIs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-nexus-blue text-nexus-blue hover:bg-nexus-blue/10" onClick={handleReadDocs}>
                  <Github className="w-4 h-4 mr-2" />
                  Deploy TideCloak SDK
                </Button>
                <Button variant="outline" className="border-muted hover:bg-muted/10" onClick={handleReadDocs}>
                  <Star className="w-4 h-4 mr-2" />
                  Combat Manual
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEXUS Capabilities */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">NEXUS Combat Systems</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beyond storage - adaptive security that responds to your mission parameters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-muted/20 bg-card/50 backdrop-blur-sm hover:shadow-mecha transition-all">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-nexus-blue" />
                  Tactical Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Mission briefings with real-time encryption. Auto-classify and stealth-mode after viewing.</p>
                <Badge variant="secondary" className="text-xs bg-nexus-blue/20 text-nexus-blue">Quantum-encrypted</Badge>
              </CardContent>
            </Card>

            <Card className="border-muted/20 bg-card/50 backdrop-blur-sm hover:shadow-mecha transition-all">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-nexus-cyan" />
                  Armory Vault
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Rapid-deploy file storage with visual targeting and instant armor deployment.</p>
                <Badge variant="secondary" className="text-xs bg-nexus-cyan/20 text-nexus-cyan">Combat-ready</Badge>
              </CardContent>
            </Card>

            <Card className="border-muted/20 bg-card/50 backdrop-blur-sm hover:shadow-mecha transition-all">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-nexus-gold" />
                  Mission Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Complete audit trail of all access patterns and security breach attempts.</p>
                <Badge variant="secondary" className="text-xs bg-nexus-gold/20 text-nexus-gold">Tactical analysis</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Deploy CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-nexus opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Deploy NEXUS?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience quantum-grade security that makes your vault mathematically unbreachable. 
            Then build your own mech-level protection.
          </p>
          
          <Button size="lg" className="bg-gradient-nexus hover:shadow-glow-nexus text-lg px-8 py-6" onClick={handleTryVault}>
            <Shield className="w-5 h-5 mr-2" />
            Launch NEXUS
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-muted/20 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-nexus-blue mr-2" />
            <span className="font-semibold">NEXUS VAULT</span>
            <Badge variant="outline" className="ml-3 text-xs px-2 py-1 text-nexus-blue border-nexus-blue">
              Powered by TideCloak
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Next-generation quantum security system. Built for pilots who need unbreachable data protection.
          </p>
        </div>
      </footer>

      {/* Demo Modal */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-nexus-blue" />
              <span>Deploy NEXUS VAULT</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              To access the full NEXUS system with TideCloak's quantum security, authenticate your pilot credentials.
            </p>
            <VaultLogin />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Index = () => {
  return (
    <>
      <Unauthenticated>
        <NexusVaultLanding />
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