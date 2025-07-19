import React, { useState, useEffect } from 'react';
import { Shield, Eye, Download, Upload, Trash2, Edit, Key, Clock, User, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AuditEvent {
  id: string;
  timestamp: Date;
  action: 'decrypt' | 'encrypt' | 'view' | 'download' | 'upload' | 'delete' | 'edit' | 'share' | 'login' | 'logout';
  itemType: 'note' | 'file' | 'folder' | 'system';
  itemId?: string;
  itemTitle?: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  details?: string;
  risk: 'low' | 'medium' | 'high';
}

export function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load audit events (in real app, this would be from backend)
    loadAuditEvents();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = events;
    
    if (filterAction !== 'all') {
      filtered = filtered.filter(event => event.action === filterAction);
    }
    
    if (filterRisk !== 'all') {
      filtered = filtered.filter(event => event.risk === filterRisk);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.itemTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, filterAction, filterRisk, searchTerm]);

  const loadAuditEvents = () => {
    // Mock audit events - in real app, fetch from secure backend
    const mockEvents: AuditEvent[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000), // 5 mins ago
        action: 'decrypt',
        itemType: 'note',
        itemId: 'note-1',
        itemTitle: 'Personal Finance Notes',
        userId: 'user-1',
        userEmail: 'user@example.com',
        ipAddress: '192.168.1.100',
        details: 'Note decrypted for viewing',
        risk: 'low'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 900000), // 15 mins ago
        action: 'download',
        itemType: 'file',
        itemId: 'file-1',
        itemTitle: 'passport_scan.pdf',
        userId: 'user-1',
        userEmail: 'user@example.com',
        ipAddress: '192.168.1.100',
        details: 'File downloaded to local device',
        risk: 'medium'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1800000), // 30 mins ago
        action: 'share',
        itemType: 'note',
        itemId: 'note-2',
        itemTitle: 'Meeting Notes - Q4 Strategy',
        userId: 'user-1',
        userEmail: 'user@example.com',
        ipAddress: '192.168.1.100',
        details: 'Secure link created with 24h expiry',
        risk: 'high'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        action: 'upload',
        itemType: 'file',
        itemId: 'file-2',
        itemTitle: 'tax_documents_2024.zip',
        userId: 'user-1',
        userEmail: 'user@example.com',
        ipAddress: '192.168.1.100',
        details: 'New encrypted file uploaded',
        risk: 'low'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        action: 'login',
        itemType: 'system',
        userId: 'user-1',
        userEmail: 'user@example.com',
        ipAddress: '192.168.1.100',
        details: 'Successful authentication via TideCloak',
        risk: 'low'
      }
    ];
    
    setEvents(mockEvents);
  };

  const getActionIcon = (action: AuditEvent['action']) => {
    const iconProps = { className: "w-4 h-4" };
    
    switch (action) {
      case 'decrypt': return <Key {...iconProps} />;
      case 'encrypt': return <Shield {...iconProps} />;
      case 'view': return <Eye {...iconProps} />;
      case 'download': return <Download {...iconProps} />;
      case 'upload': return <Upload {...iconProps} />;
      case 'delete': return <Trash2 {...iconProps} />;
      case 'edit': return <Edit {...iconProps} />;
      case 'share': return <User {...iconProps} />;
      case 'login':
      case 'logout': return <User {...iconProps} />;
      default: return <Shield {...iconProps} />;
    }
  };

  const getActionColor = (action: AuditEvent['action']) => {
    switch (action) {
      case 'decrypt':
      case 'view': return 'text-decrypted';
      case 'delete': return 'text-destructive';
      case 'share': return 'text-warning';
      case 'download': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadge = (risk: AuditEvent['risk']) => {
    const variants = {
      low: 'bg-decrypted-bg text-decrypted border-decrypted',
      medium: 'bg-warning-bg text-warning border-warning',
      high: 'bg-destructive/10 text-destructive border-destructive'
    };
    
    return (
      <Badge variant="outline" className={variants[risk]}>
        {risk.toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security Audit Log
        </CardTitle>
        <CardDescription>
          Comprehensive log of all security-related activities
        </CardDescription>
        
        <div className="flex gap-4 pt-4">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="decrypt">Decrypt</SelectItem>
              <SelectItem value="download">Download</SelectItem>
              <SelectItem value="share">Share</SelectItem>
              <SelectItem value="upload">Upload</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <div key={event.id}>
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                  <div className={`p-2 rounded-lg bg-muted ${getActionColor(event.action)}`}>
                    {getActionIcon(event.action)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {event.action} {event.itemType}
                        </span>
                        {event.itemTitle && (
                          <span className="text-muted-foreground">
                            "{event.itemTitle}"
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(event.risk)}
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {event.details}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {event.userEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                      <span>IP: {event.ipAddress}</span>
                    </div>
                  </div>
                </div>
                
                {index < filteredEvents.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No audit events found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}