import React, { useState } from 'react';
import { Shield, Github, ArrowRight, Zap, Key, Server, Users, Code, CheckCircle, Star, ExternalLink, BookOpen, Clock, Database, Lock } from 'lucide-react';
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

  const handleTryVault = () => {
    setShowDemo(true);
  };

  const handleViewGitHub = () => {
    window.open('https://github.com/tidecloak/secure-vault-demo', '_blank');
  };

  const handleReadDocs = () => {
    window.open('https://docs.tidecloak.com', '_blank');
  };

  const features = [
    {
      icon: Database,
      title: "Encrypted Notes",
      description: "Create and store your personal notes with military-grade encryption. Rich text, tags, and search.",
      gradient: "bg-gradient-hero"
    },
    {
      icon: Lock,
      title: "Secure File Storage",
      description: "Upload and protect any file type. Documents, images, videos — all secured with keyless encryption.",
      gradient: "bg-gradient-secure"
    },
    {
      icon: Key,
      title: "Keyless Technology",
      description: "Powered by TideCloak's breakthrough security. Your encryption keys never exist in full, making them unstealable.",
      gradient: "bg-gradient-feature"
    },
    {
      icon: Shield,
      title: "Instant Access",
      description: "Decrypt your data on-demand with cryptographic verification. Fast, secure, and seamless.",
      gradient: "bg-gradient-cta"
    }
  ];

  const benefits = [
    "Your notes and files are protected by keys that never exist in full",
    "Even if servers are compromised, your data remains encrypted and safe", 
    "Access your vault from anywhere with instant cryptographic verification",
    "Built by developers who believe security should be invisible and unbreakable"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-tidecloak-light">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-tidecloak-blue border-tidecloak-blue bg-tidecloak-blue/10 animate-glow-pulse">
              <Zap className="w-4 h-4 mr-2" />
              Powered by TideCloak Keyless Security
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-hero bg-clip-text text-transparent">SecureVault</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-muted-foreground">
              Your Personal Data Vault with Unbreakable Security
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Store your notes and files with <strong className="text-tidecloak-purple">revolutionary keyless encryption</strong>. 
              Built with TideCloak - the security that doesn't exist, so it can't be stolen.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-gradient-hero hover:shadow-glow-primary text-lg px-8 py-6 text-white" onClick={handleTryVault}>
                <Shield className="w-5 h-5 mr-2" />
                Open Your Vault
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10 text-lg px-8 py-6" onClick={handleViewGitHub}>
                <Github className="w-5 h-5 mr-2" />
                View Source Code
              </Button>
            </div>

            {/* Vault Features */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                Encrypted Notes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                Secure File Storage
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                Keyless Security
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features */}
      <section className="py-20 bg-tidecloak-light/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              What Makes This Vault <span className="text-tidecloak-purple">Unbreakable</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Unlike traditional vaults that store encryption keys, SecureVault uses TideCloak's revolutionary 
              keyless technology. The keys protecting your data never exist in full — anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden shadow-card border-0 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`absolute inset-0 ${feature.gradient} opacity-5`}></div>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${feature.gradient} flex items-center justify-center animate-float`} style={{ animationDelay: `${index * 0.2}s` }}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Key Benefits */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Why Your Data is Truly Safe</h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-card shadow-card animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-6 h-6 rounded-full bg-gradient-secure flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-foreground font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">How SecureVault Protects Your Data</h2>
            <p className="text-xl text-muted-foreground">
              See TideCloak's keyless security in action with your personal vault
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-hero flex items-center justify-center">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <CardTitle>1. Store</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload your notes and files to SecureVault. Each item is encrypted with unique, fragmented keys
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-secure flex items-center justify-center">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <CardTitle>2. Protect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  TideCloak distributes key fragments across a decentralized network. No single point can access your data
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-feature flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle>3. Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  When you need your data, cryptographic verification grants instant access. Fast, secure, seamless
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Secure Your Data?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Experience the future of data security. Your personal vault awaits, protected by technology that makes theft impossible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-tidecloak-blue hover:bg-white/90 text-lg px-8 py-6" onClick={handleTryVault}>
              <Shield className="w-5 h-5 mr-2" />
              Open SecureVault
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6" onClick={handleReadDocs}>
              <BookOpen className="w-5 h-5 mr-2" />
              Learn About TideCloak
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-tidecloak-blue" />
              SecureVault Demo
            </DialogTitle>
          </DialogHeader>
          <VaultProvider>
            <Unauthenticated>
              <VaultLogin />
            </Unauthenticated>
            <Authenticated>
              <VaultDashboard />
            </Authenticated>
          </VaultProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecureVaultLanding;