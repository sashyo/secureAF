import React, { memo } from 'react';
import { Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BackupConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupEnabled: boolean;
  setBackupEnabled: (enabled: boolean) => void;
  backupFrequency: string;
  setBackupFrequency: (frequency: string) => void;
  onSave: () => void;
}

export const BackupConfigDialog = memo(function BackupConfigDialog({
  open,
  onOpenChange,
  backupEnabled,
  setBackupEnabled,
  backupFrequency,
  setBackupFrequency,
  onSave
}: BackupConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-tidecloak-blue" />
            Backup Reminders
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="backup-enabled" className="text-base">
              Enable automatic backup reminders
            </Label>
            <Switch
              id="backup-enabled"
              checked={backupEnabled}
              onCheckedChange={setBackupEnabled}
            />
          </div>
          
          {backupEnabled && (
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Reminder frequency</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} className="bg-tidecloak-blue hover:bg-tidecloak-blue/90">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});