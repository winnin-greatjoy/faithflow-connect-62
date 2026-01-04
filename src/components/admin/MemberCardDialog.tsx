import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MembershipCard } from './MembershipCard';

interface MemberCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: any;
  branchName: string;
}

export const MemberCardDialog: React.FC<MemberCardDialogProps> = ({
  open,
  onOpenChange,
  member,
  branchName,
}) => {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] glass overflow-hidden border-none p-10">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-serif font-black text-center">
            Digital Membership Card
          </DialogTitle>
          <DialogDescription className="text-center text-[10px] font-bold uppercase tracking-widest opacity-60">
            Official identity token for {member.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <MembershipCard member={member} branchName={branchName} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-muted-foreground font-medium max-w-[300px] mx-auto opacity-40">
            This card contains a secure QR code that can be used for verification, attendance
            tracking, and service check-ins across the FaithFlow network.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
