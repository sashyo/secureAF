import React, { useState, useEffect } from 'react';
import { Shield, Lock, Clock, Moon, Sun, Settings, LogOut, Eye, EyeOff } from 'lucide-react';
import { useTideCloak } from '@tidecloak/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SecurityHeaderProps {
  onSettingsToggle: () => void;
  onSessionTimeLeft?: (timeLeft: number) => void;
}

export function SecurityHeader({ onSettingsToggle, onSessionTimeLeft }: SecurityHeaderProps) {
  const { logout, userInfo } = useTideCloak();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(3600); // 1 hour default
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Session countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        onSessionTimeLeft?.(newTime);
        
        if (newTime === 300) { // 5 minutes warning
          toast({
            title: "Session Warning",
            description: "Your session will expire in 5 minutes",
            variant: "destructive"
          });
        }
        
        if (newTime === 0) {
          toast({
            title: "Session Expired",
            description: "Automatically logging out for security",
            variant: "destructive"
          });
          logout();
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [logout, toast, onSessionTimeLeft]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    if (sessionTimeLeft < 300) return 'text-destructive';
    if (sessionTimeLeft < 900) return 'text-warning';
    return 'text-decrypted';
  };

  return (
    <Card className="border-b rounded-none bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        {/* Left side - Security branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-security rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">SecureVault</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-decrypted-bg border-decrypted">
                  <Lock className="w-3 h-3 mr-1" />
                  TideCloak Secured
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Session indicator */}
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-muted ${getSessionColor()}`}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-mono">{formatTime(sessionTimeLeft)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Session expires in {formatTime(sessionTimeLeft)}</p>
            </TooltipContent>
          </Tooltip>

          {userInfo && (
            <Badge variant="secondary" className="bg-primary-glow/10">
              {userInfo.email || 'Authenticated User'}
            </Badge>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Privacy Mode Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className={isPrivacyMode ? 'bg-warning-bg text-warning' : ''}
              >
                {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPrivacyMode ? 'Disable' : 'Enable'} Privacy Mode</p>
            </TooltipContent>
          </Tooltip>

          {/* Dark Mode Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle {isDarkMode ? 'Light' : 'Dark'} Mode</p>
            </TooltipContent>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onSettingsToggle}>
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Security Settings</p>
            </TooltipContent>
          </Tooltip>

          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Secure Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Privacy mode overlay */}
      {isPrivacyMode && (
        <div className="absolute inset-0 bg-warning-bg/20 backdrop-blur-sm flex items-center justify-center">
          <Badge variant="outline" className="bg-warning text-warning-foreground border-warning">
            <EyeOff className="w-3 h-3 mr-1" />
            Privacy Mode Active
          </Badge>
        </div>
      )}
    </Card>
  );
}