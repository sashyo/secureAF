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
      icon: Key,
      title: "Keyless by Design",
      description: "The private key never fully exists — not even in memory. It's fragmented across our Security Fabric.",
      gradient: "bg-gradient-hero"
    },
    {
      icon: Shield,
      title: "Tamper-Proof Access",
      description: "All access is cryptographically verified through advanced threshold cryptography. No backdoors, ever.",
      gradient: "bg-gradient-secure"
    },
    {
      icon: Server,
      title: "Decentralized by Default",
      description: "Key fragments are distributed across a decentralized network. No single point of failure exists.",
      gradient: "bg-gradient-feature"
    },
    {
      icon: Code,
      title: "Built for Dev Speed",
      description: "Add world-class encryption to your app without understanding cryptography. Just vibe with your code.",
      gradient: "bg-gradient-cta"
    }
  ];

  const benefits = [
    "The key never exists in full — not even for a second",
    "No one — not even you — can see the whole key",
    "This isn't encryption as usual — this is unstealable security",
    "Instant integration with zero crypto knowledge required"
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
              <span className="bg-gradient-hero bg-clip-text text-transparent">Vibe with Your Code</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-muted-foreground">
              Let TideCloak Handle Security
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              This isn't just another auth tool — it's a <strong className="text-tidecloak-purple">revolution in how apps secure data</strong>. 
              Add unstealable encryption without lifting a finger.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-gradient-hero hover:shadow-glow-primary text-lg px-8 py-6 text-white" onClick={handleTryVault}>
                <Shield className="w-5 h-5 mr-2" />
                Explore the Vault
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10 text-lg px-8 py-6" onClick={handleReadDocs}>
                <BookOpen className="w-5 h-5 mr-2" />
                Read the Docs
              </Button>
              <Button variant="outline" size="lg" className="border-muted-foreground text-muted-foreground hover:bg-muted text-lg px-8 py-6" onClick={handleViewGitHub}>
                <Github className="w-5 h-5 mr-2" />
                Star us on GitHub
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                Open Source
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                Zero Config
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                Production Ready
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
              Why TideCloak is <span className="text-tidecloak-purple">Revolutionary</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              This isn't encryption as usual. TideCloak fragments and distributes keys so completely that 
              they never exist in full — anywhere, ever.
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
            <h3 className="text-2xl font-bold text-center mb-8">The Security That Doesn't Exist</h3>
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
            <h2 className="text-4xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to unstealable security
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-hero flex items-center justify-center">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <CardTitle>1. Fragment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your key is broken into cryptographic fragments before it ever exists in full
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-secure flex items-center justify-center">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <CardTitle>2. Distribute</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fragments are distributed across our decentralized Security Fabric
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-feature flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle>3. Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access is granted through threshold cryptography — no single point holds enough to decrypt
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build with Unstealable Security?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join developers who are vibing with their code while TideCloak handles the cryptography.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-tidecloak-blue hover:bg-white/90 text-lg px-8 py-6" onClick={handleTryVault}>
              <Shield className="w-5 h-5 mr-2" />
              Try the Vault Demo
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6" onClick={handleReadDocs}>
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Documentation
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