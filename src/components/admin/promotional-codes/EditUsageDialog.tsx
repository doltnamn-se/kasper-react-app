import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditUsageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  codeData: {
    id: string;
    code: string;
    customer_name?: string;
    usage_count: number;
  } | null;
  onUpdate: () => void;
}

export const EditUsageDialog = ({ isOpen, onClose, codeData, onUpdate }: EditUsageDialogProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [usageCount, setUsageCount] = useState(codeData?.usage_count || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    setUsageCount(codeData?.usage_count || 0);
  }, [codeData]);

  const handleSave = async () => {
    if (!codeData) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('promotional_codes')
        .update({ usage_count: usageCount })
        .eq('id', codeData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Usage count updated successfully",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating usage count:', error);
      toast({
        title: "Error",
        description: "Failed to update usage count",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setUsageCount(codeData?.usage_count || 0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Coupon Usage</DialogTitle>
        </DialogHeader>
        
        {codeData && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
                {codeData.code}
              </div>
            </div>
            
            {codeData.customer_name && (
              <div className="space-y-2">
                <Label>Assigned to</Label>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                  {codeData.customer_name}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="usage-count">Usage Count</Label>
              <Input
                id="usage-count"
                type="number"
                min="0"
                value={usageCount}
                onChange={(e) => setUsageCount(parseInt(e.target.value) || 0)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Current discount: -{usageCount * 50} kr
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};