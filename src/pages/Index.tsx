import React from 'react';
import { Shield, Zap, Globe, Code, Star, Github, Book, ArrowRight, Lock, Key, Cpu, Network } from 'lucide-react';
import { Authenticated, Unauthenticated } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VaultProvider } from '@/contexts/VaultContext';
import { VaultLogin } from '@/components/VaultLogin';
import { VaultDashboard } from '@/components/VaultDashboard';

const RevolutionaryLanding = () => {
  const features = [
    {
      icon: Key,
      title: "Keyless by Design",
      description: "The key never exists in full — not even for a second. Revolutionary threshold cryptography fragments ensure unstealable security.",
      gradient: "bg-gradient-keyless"
    },
    {
      icon: Shield,
      title: "Tamper-Proof Access", 
      description: "All access is cryptographically verified. No single point holds enough to decrypt anything — there is no key to steal.",
      gradient: "bg-gradient-cyber"
    },
    {
      icon: Network,
      title: "Decentralized by Default",
      description: "Security fragments distributed across our decentralized Security Fabric. No central point of failure, ever.",
      gradient: "bg-gradient-electric"
    },
    {
      icon: Zap,
      title: "Built for Dev Speed",
      description: "Get instant, unstealable encryption without understanding cryptography. Vibers should vibe — not worry about crypto.",
      gradient: "bg-gradient-hero"
    }
  ];

  const testimonials = [
    {
      quote: "This isn't encryption as usual — this is unstealable security. Game changer.",
      author: "Sarah Chen",
      role: "Lead Developer @ TechFlow"
    },
    {
      quote: "Finally, world-class cryptography that doesn't make me feel like I need a PhD.",
      author: "Marcus Rodriguez", 
      role: "Founder @ DevVibe"
    },
    {
      quote: "The key never existing in full blew my mind. This is the future of app security.",
      author: "Alex Kim",
      role: "Security Engineer @ CyberFirst"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-tide-dark to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-tide-purple border-tide-purple bg-tide-purple/10">
              <Cpu className="w-4 h-4 mr-2" />
              Powered by Revolutionary Threshold Cryptography
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Vibe with Your Code
            </h1>
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-foreground/90">
              Let TideCloak Handle Security
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              The first keyless security platform. No keys to manage, no keys to steal, no keys to worry about. 
              Just unstealable encryption that works instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-hero hover:shadow-glow-purple text-lg px-8 py-6">
                <Shield className="w-5 h-5 mr-2" />
                Explore the Vault
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-tide-purple text-tide-purple hover:bg-tide-purple/10 text-lg px-8 py-6">
                <Book className="w-5 h-5 mr-2" />
                Read the Docs
              </Button>
              <Button variant="outline" size="lg" className="border-muted hover:bg-muted/10 text-lg px-8 py-6">
                <Github className="w-5 h-5 mr-2" />
                Star on GitHub
                <Star className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-keyless mb-2">0 Keys</div>
                <div className="text-sm text-muted-foreground">Ever Generated or Stored</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-decentralized mb-2">100% Decentralized</div>
                <div className="text-sm text-muted-foreground">Security Fabric</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-unstealable mb-2">∞ Unstealable</div>
                <div className="text-sm text-muted-foreground">By Mathematical Design</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">This Changes Everything</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Not just another auth tool — a complete revolution in how applications secure data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-revolutionary transition-all duration-300 border-muted/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How the Magic Happens</h2>
            <p className="text-xl text-muted-foreground">
              Revolutionary threshold cryptography that makes keys obsolete
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-keyless rounded-full flex items-center justify-center">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Fragment & Distribute</h3>
              <p className="text-muted-foreground">
                Your data is protected by cryptographic fragments distributed across our decentralized Security Fabric.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-cyber rounded-full flex items-center justify-center">
                <Network className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Verify & Access</h3>
              <p className="text-muted-foreground">
                All access is cryptographically verified through advanced threshold protocols. No keys, no risk.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-electric rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Stay Unstealable</h3>
              <p className="text-muted-foreground">
                No one — not even you — can see the whole key. It's mathematically impossible to steal what doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Developers Are Vibing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-muted/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">Ready to Build the Future?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who've discovered unstealable security. 
            Because vibers should vibe — not worry about crypto.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-hero hover:shadow-glow-purple text-lg px-8 py-6">
              <Shield className="w-5 h-5 mr-2" />
              Start Building
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="border-tide-purple text-tide-purple hover:bg-tide-purple/10 text-lg px-8 py-6">
              <Github className="w-5 h-5 mr-2" />
              Explore on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-muted/20 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-tide-purple mr-2" />
            <span className="text-lg font-semibold">SecureVault</span>
            <Badge variant="outline" className="ml-3 text-xs px-2 py-1 text-tide-purple border-tide-purple">
              Powered by TideCloak
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Revolutionary keyless security. Built for developers who want to vibe with their code.
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
        <RevolutionaryLanding />
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