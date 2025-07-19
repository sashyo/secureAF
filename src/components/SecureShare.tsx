import React, { useState, useEffect } from 'react';
import { Share2, Clock, Copy, Eye, Trash2, Link, QrCode } from 'lucide-react';
import { useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface SecureLink {
  id: string;
  url: string;
  expiresAt: Date;
  maxViews: number;
  currentViews: number;
  itemType: 'note' | 'file';
  itemId: string;
  itemTitle: string;
  isActive: boolean;
}

export function SecureShare({ itemId, itemTitle, itemType }: { 
  itemId: string; 
  itemTitle: string; 
  itemType: 'note' | 'file';
}) {
  const { doEncrypt } = useTideCloak();
  const { toast } = useToast();
  const [expiryType, setExpiryType] = useState<'time' | 'views'>('time');
  const [expiryHours, setExpiryHours] = useState(24);
  const [maxViews, setMaxViews] = useState(1);
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLinks, setActiveLinks] = useState<SecureLink[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Load existing links
  useEffect(() => {
    loadActiveLinks();
  }, [itemId]);

  const loadActiveLinks = () => {
    // In a real app, this would fetch from a backend
    const stored = localStorage.getItem(`secure-links-${itemId}`);
    if (stored) {
      const links = JSON.parse(stored);
      setActiveLinks(links.filter((link: SecureLink) => 
        new Date(link.expiresAt) > new Date() && link.isActive
      ));
    }
  };

  const generateSecureLink = async () => {
    if (!doEncrypt) {
      toast({
        title: "Authentication Required",
        description: "You must be authenticated to create secure links",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate unique link ID
      const linkId = crypto.randomUUID();
      
      // Calculate expiry
      const expiresAt = new Date();
      if (expiryType === 'time') {
        expiresAt.setHours(expiresAt.getHours() + expiryHours);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days for view-based
      }

      // Create encrypted payload
      const payload = {
        itemId,
        itemType,
        linkId,
        expiresAt: expiresAt.toISOString(),
        maxViews: expiryType === 'views' ? maxViews : 999,
        password: requirePassword ? password : null
      };

      const encryptResult = await doEncrypt([{
        data: JSON.stringify(payload),
        tags: ['secure-share']
      }]);

      if (!encryptResult || encryptResult.length === 0) {
        throw new Error('Failed to encrypt share data');
      }

      // Generate shareable URL
      const shareToken = btoa(JSON.stringify(encryptResult[0]));
      const shareUrl = `${window.location.origin}/share/${shareToken}`;

      // Save link info
      const newLink: SecureLink = {
        id: linkId,
        url: shareUrl,
        expiresAt,
        maxViews: expiryType === 'views' ? maxViews : 999,
        currentViews: 0,
        itemType,
        itemId,
        itemTitle,
        isActive: true
      };

      const existingLinks = JSON.parse(localStorage.getItem(`secure-links-${itemId}`) || '[]');
      const updatedLinks = [...existingLinks, newLink];
      localStorage.setItem(`secure-links-${itemId}`, JSON.stringify(updatedLinks));

      setActiveLinks(prev => [...prev, newLink]);
      setGeneratedLink(shareUrl);

      toast({
        title: "Secure Link Generated",
        description: "Your encrypted share link has been created",
      });

    } catch (error) {
      console.error('Failed to generate secure link:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to create secure link",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Secure link copied to clipboard",
    });
  };

  const revokeLink = (linkId: string) => {
    const existingLinks = JSON.parse(localStorage.getItem(`secure-links-${itemId}`) || '[]');
    const updatedLinks = existingLinks.map((link: SecureLink) => 
      link.id === linkId ? { ...link, isActive: false } : link
    );
    localStorage.setItem(`secure-links-${itemId}`, JSON.stringify(updatedLinks));
    
    setActiveLinks(prev => prev.filter(link => link.id !== linkId));
    
    toast({
      title: "Link Revoked",
      description: "Secure link has been deactivated",
    });
  };

  const getTimeLeft = (expiresAt: Date) => {
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Secure Share
        </CardTitle>
        <CardDescription>
          Create time-limited encrypted links for "{itemTitle}"
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Link</TabsTrigger>
            <TabsTrigger value="manage">Manage Links</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Expiry Type</Label>
                <Select value={expiryType} onValueChange={(value: 'time' | 'views') => setExpiryType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Time-based</SelectItem>
                    <SelectItem value="views">View-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {expiryType === 'time' && (
                <div>
                  <Label>Expires in (hours)</Label>
                  <Select value={expiryHours.toString()} onValueChange={(value) => setExpiryHours(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="72">3 days</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {expiryType === 'views' && (
                <div>
                  <Label>Maximum views</Label>
                  <Select value={maxViews.toString()} onValueChange={(value) => setMaxViews(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 view</SelectItem>
                      <SelectItem value="3">3 views</SelectItem>
                      <SelectItem value="5">5 views</SelectItem>
                      <SelectItem value="10">10 views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="require-password"
                  checked={requirePassword}
                  onCheckedChange={setRequirePassword}
                />
                <Label htmlFor="require-password">Require password</Label>
              </div>

              {requirePassword && (
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password for link access"
                  />
                </div>
              )}

              <Button 
                onClick={generateSecureLink} 
                disabled={isGenerating || (requirePassword && !password)}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Generate Secure Link
                  </>
                )}
              </Button>

              {generatedLink && (
                <Card className="bg-decrypted-bg border-decrypted">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-decrypted font-medium">Generated Link</Label>
                        <Badge variant="outline" className="bg-decrypted text-decrypted-foreground">
                          Active
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          value={generatedLink} 
                          readOnly 
                          className="font-mono text-xs"
                        />
                        <Button size="icon" onClick={() => copyLink(generatedLink)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            {activeLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active secure links</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeLinks.map((link) => (
                  <Card key={link.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {link.currentViews}/{link.maxViews} views
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Expires: {getTimeLeft(link.expiresAt)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {link.url.substring(0, 60)}...
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => copyLink(link.url)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => revokeLink(link.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}