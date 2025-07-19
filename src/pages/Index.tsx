import React, { useState } from 'react';
import { Shield, Github, ArrowRight, Zap, Key, Server, Users, Code, CheckCircle, Star, ExternalLink, BookOpen, Clock, Database, Lock } from 'lucide-react';
import { Authenticated, Unauthenticated, useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VaultProvider } from '@/contexts/VaultContext';
import { VaultLogin } from '@/components/VaultLogin';
import { VaultDashboard } from '@/components/VaultDashboard';

const VibeVaultLanding = () => {
  return (
    <VaultProvider>
      <Authenticated>
        <VaultDashboard />
      </Authenticated>
      <Unauthenticated>
        <LandingContent />
      </Unauthenticated>
    </VaultProvider>
  );
};

const LandingContent = () => {
  const { login } = useTideCloak();

  const handleViewGitHub = () => {
    window.open('https://github.com/tidecloak/secure-vault-demo', '_blank');
  };

  const handleReadDocs = () => {
    window.open('https://docs.tidecloak.com', '_blank');
  };

  const vaultFeatures = [
    {
      icon: Database,
      title: "Encrypted Data Storage",
      description: "Store your sensitive files, notes, and documents with military-grade security. Access anywhere, anytime.",
      gradient: "bg-gradient-hero"
    },
    {
      icon: Shield,
      title: "Zero-Knowledge Architecture", 
      description: "Your data is encrypted before it leaves your device. Even we can't see what you store.",
      gradient: "bg-gradient-secure"
    },
    {
      icon: Users,
      title: "Secure Sharing",
      description: "Share encrypted files and folders with team members while maintaining complete control over access.",
      gradient: "bg-gradient-feature"
    },
    {
      icon: Clock,
      title: "Version History",
      description: "Track changes and restore previous versions of your documents with tamper-proof audit trails.",
      gradient: "bg-gradient-cta"
    }
  ];

  const securityFeatures = [
    {
      icon: Key,
      title: "Keyless by Design",
      description: "The key is broken into fragments and distributed across a decentralized Security Fabric.",
      gradient: "bg-gradient-hero"
    },
    {
      icon: Shield,
      title: "Tamper-Proof Access",
      description: "All access is cryptographically verified through advanced threshold cryptography.",
      gradient: "bg-gradient-secure"
    },
    {
      icon: Server,
      title: "Decentralized by Default",
      description: "No single point ever holds enough to decrypt anything — there is no key to steal.",
      gradient: "bg-gradient-feature"
    },
    {
      icon: Zap,
      title: "Built for Dev Speed",
      description: "Developers get instant, unstealable encryption without needing to understand cryptography at all.",
      gradient: "bg-gradient-cta"
    }
  ];

  const benefits = [
    "The key never exists in full — not even for a second",
    "No one — not even you — can see the whole key", 
    "This isn't encryption as usual — this is unstealable security",
    "Vibers should vibe — not worry about auth, keys, or crypto. Those aren't vibes."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-tidecloak-light">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-tidecloak-blue border-tidecloak-blue bg-tidecloak-blue/10 animate-glow-pulse">
              <Shield className="w-4 h-4 mr-2" />
              Secured by TideCloak Technology
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              VibeVault
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium mb-8 text-tidecloak-blue">
              Vibe with Your Code — Let TideCloak Handle Security
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              The private key is never fully generated or stored anywhere — not even in memory. 
              <strong className="text-tidecloak-purple">Vibers should vibe — not worry about auth, keys, or crypto. Those aren't vibes.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-tidecloak-blue hover:bg-tidecloak-blue/90 hover:shadow-glow-primary text-lg px-8 py-6" onClick={login}>
                <Database className="w-5 h-5 mr-2 text-white" />
                <span className="text-white">Open Your Vault</span>
                <ArrowRight className="w-5 h-5 ml-2 text-white" />
              </Button>
              <Button variant="outline" size="lg" className="border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10 text-lg px-8 py-6" onClick={handleReadDocs}>
                <BookOpen className="w-5 h-5 mr-2 text-tidecloak-blue" />
                <span className="text-tidecloak-blue">Read the Docs</span>
              </Button>
              <Button variant="outline" size="lg" className="border-foreground text-foreground hover:bg-muted text-lg px-8 py-6" onClick={handleViewGitHub}>
                <Github className="w-5 h-5 mr-2 text-foreground" />
                <span className="text-foreground">Star us on GitHub</span>
                <ExternalLink className="w-4 h-4 ml-2 text-foreground" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                Zero-Knowledge
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                End-to-End Encrypted
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-tidecloak-green" />
                Keyless Security
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vault Features */}
      <section className="py-20 bg-tidecloak-light/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Explore the <span className="text-tidecloak-purple">Vault</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Store, manage, and share sensitive data while you vibe with your code — security handled.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {vaultFeatures.map((feature, index) => (
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
        </div>
      </section>

      {/* TideCloak Security Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              How <span className="text-tidecloak-blue">TideCloak</span> Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Revolutionary keyless encryption that makes your vault truly unstealable. The key never exists — anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {securityFeatures.map((feature, index) => (
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
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">Why This Changes Everything</h3>
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
      <section className="py-20 bg-tidecloak-light/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">How TideCloak Works</h2>
            <p className="text-xl text-muted-foreground">
              Three revolutionary steps that make traditional encryption obsolete
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-hero flex items-center justify-center">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-foreground">1. Fragment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your encryption key is broken into cryptographic fragments before it ever exists in full
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-secure flex items-center justify-center">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-foreground">2. Distribute</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fragments are distributed across TideCloak's decentralized Security Fabric
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card border-0">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-feature flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-foreground">3. Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access is granted through threshold cryptography — no single point can decrypt
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Developer CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Add This to Your App?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            VibeVault is built with TideCloak SDK. You can add the same unstealable security to your applications with just a few lines of code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white hover:bg-white/90 text-lg px-8 py-6" onClick={login}>
              <Database className="w-5 h-5 mr-2 text-tidecloak-blue" />
              <span className="text-tidecloak-blue">Explore the Vault</span>
            </Button>
            <Button variant="outline" size="lg" className="border-white hover:bg-white/10 text-lg px-8 py-6" onClick={handleReadDocs}>
              <Code className="w-5 h-5 mr-2 text-white" />
              <span className="text-white">Read the Docs</span>
            </Button>
            <Button variant="outline" size="lg" className="border-white hover:bg-white/10 text-lg px-8 py-6" onClick={handleViewGitHub}>
              <Github className="w-5 h-5 mr-2 text-white" />
              <span className="text-white">Star us on GitHub</span>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default VibeVaultLanding;