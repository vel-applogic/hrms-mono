'use client';

import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import type { AdminUserListResponseType } from '@repo/dto';
import { PlanDtoEnum } from '@repo/dto';
import { useState } from 'react';

import { downgradeUserPlan, upgradeUserPlan } from '@/lib/action/user.actions';

interface UserPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserListResponseType | null;
  onSuccess: () => void;
}

export function UserPlanDialog({ open, onOpenChange, user, onSuccess }: UserPlanDialogProps) {
  const [loading, setLoading] = useState(false);
  const isUpgrading = user?.plan === PlanDtoEnum.free;

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (isUpgrading) {
        await upgradeUserPlan(user.id);
      } else {
        await downgradeUserPlan(user.id);
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error(`Failed to ${isUpgrading ? 'upgrade' : 'downgrade'} user plan`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isUpgrading ? 'Upgrade to Premium' : 'Downgrade to Free'}</DialogTitle>
          <DialogDescription>
            {isUpgrading ? (
              <>
                Are you sure you want to upgrade <strong>{user?.firstname} {user?.lastname}</strong> ({user?.email}) to the <strong>Premium</strong> plan?
              </>
            ) : (
              <>
                Are you sure you want to downgrade <strong>{user?.firstname} {user?.lastname}</strong> ({user?.email}) to the <strong>Free</strong> plan?
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant={isUpgrading ? 'default' : 'destructive'} onClick={handleConfirm} disabled={loading}>
            {loading
              ? isUpgrading ? 'Upgrading...' : 'Downgrading...'
              : isUpgrading ? 'Upgrade' : 'Downgrade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
