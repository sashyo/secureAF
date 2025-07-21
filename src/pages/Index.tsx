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

const SecureVaultLanding = () => {
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
    window.open('https://github.com/sashyo/sashyo.github.io', '_blank');
  };

  const handleReadDocs = () => {
    window.open('https://arxiv.org/pdf/2309.00915.pdf', '_blank');
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
      description: "Your vault's key is mathematically impossible to steal — it's never created in full, anywhere.",
      gradient: "bg-gradient-hero"
    },
    {
      icon: Shield,
      title: "Provable Security",
      description: "Cryptographic proof that your data cannot be accessed without proper authorization. Mathematical certainty.",
      gradient: "bg-gradient-secure"
    },
    {
      icon: Server,
      title: "Decentralized Protection",
      description: "Key fragments decentralized across independent nodes. No central authority can access your data.",
      gradient: "bg-gradient-feature"
    },
    {
      icon: Zap,
      title: "Zero-Weakness Architecture",
      description: "Advanced threshold cryptography eliminates traditional attack vectors. Unhackable by design.",
      gradient: "bg-gradient-cta"
    }
  ];

  const benefits = [
    "Mathematically proven: your key cannot be reconstructed by attackers",
    "Even we cannot access your data — true zero-knowledge security", 
    "First vault with cryptographic immunity to traditional hacking methods",
    "Breakthrough technology that makes data breaches physically impossible"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-tidecloak-light">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tidecloak-blue/10 border border-tidecloak-blue/20 text-tidecloak-blue text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Next-Generation Security
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 text-foreground">
              SecureAF
            </h1>
            <h2 className="text-3xl md:text-4xl font-light mb-8 text-tidecloak-blue">
              Your Data, Impossible to Steal
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Store your most sensitive files with <strong className="text-tidecloak-purple">unbreakable protection</strong>. 
              Advanced cryptography that's mathematically proven to be secure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-tidecloak-blue hover:bg-tidecloak-blue/90 text-white text-lg px-10 py-6 rounded-xl" onClick={login}>
                <Database className="w-5 h-5 mr-2" />
                Start Protecting Your Data
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-tidecloak-blue text-tidecloak-blue hover:bg-tidecloak-blue/10 text-lg px-10 py-6 rounded-xl" onClick={handleViewGitHub}>
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-tidecloak-green" />
                Zero-Knowledge Architecture
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-tidecloak-blue" />
                End-to-End Encrypted
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-tidecloak-purple" />
                Decentralized Architecture
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-tidecloak-blue/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-tidecloak-purple/10 blur-3xl"></div>
        </div>
      </section>


      {/* TideCloak Security Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why This Vault is <span className="text-tidecloak-blue">Unbreakable</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Built on <a href="https://tide.org" target="_blank" rel="noopener noreferrer" className="text-tidecloak-blue hover:underline font-semibold">Tide Foundation's</a> threshold cryptography research. Unlike traditional security that relies on keeping keys secret, Tide fragments keys across multiple nodes so no single point can ever reconstruct them.
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
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">Provable Security Guarantees</h3>
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


      {/* Developer CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Store What Matters Most</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Finally, a vault where your most sensitive data is actually safe. No keys to steal, no backdoors to exploit.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="bg-white text-tidecloak-blue hover:bg-white/90 font-semibold text-lg px-12 py-6" onClick={login}>
              <Database className="w-5 h-5 mr-2" />
              Try SecureAF Now
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SecureVaultLanding;
