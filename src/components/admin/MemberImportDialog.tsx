import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BulkMemberImport } from './BulkMemberImport';

interface MemberImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  onSuccess: () => void;
}

export const MemberImportDialog: React.FC<MemberImportDialogProps> = ({
  open,
  onOpenChange,
  branchId,
  onSuccess,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Members</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import multiple members at once.
          </DialogDescription>
        </DialogHeader>

        <BulkMemberImport
          branchId={branchId}
          onSuccess={() => {
            onSuccess();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
