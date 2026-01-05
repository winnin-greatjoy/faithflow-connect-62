import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  districtName?: string;
  departments?: string[];
}

export const MemberCardDialog: React.FC<MemberCardDialogProps> = ({
  open,
  onOpenChange,
  member,
  branchName,
  districtName,
  departments: propDepartments,
}) => {
  const [internalDistrict, setInternalDistrict] = useState<string | undefined>(districtName);
  const [internalDepartments, setInternalDepartments] = useState<string[] | undefined>(
    propDepartments
  );

  useEffect(() => {
    const fetchExtraData = async () => {
      if (!member) return;

      // Only fetch if not provided via props
      if (!districtName) {
        const { data: branchData } = await supabase
          .from('church_branches')
          .select('*, districts(name)')
          .eq('id', member.branch_id || member.branchId)
          .single();

        if (branchData?.districts) {
          setInternalDistrict(branchData.districts.name);
        }
      }

      if (!propDepartments) {
        const { data: deptData } = await supabase
          .from('department_assignments')
          .select('*, departments(name)')
          .eq('member_id', member.id)
          .eq('status', 'approved');

        if (deptData) {
          setInternalDepartments(deptData.map((d: any) => d.departments.name));
        }
      }
    };

    if (open && member) {
      fetchExtraData();
    }
  }, [open, member, districtName, propDepartments]);

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-primary/10 shadow-2xl p-6 sm:p-10">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-lg sm:text-xl font-serif font-black text-center">
            Digital Membership Card
          </DialogTitle>
          <DialogDescription className="text-center text-[10px] font-bold uppercase tracking-widest opacity-60">
            Official identity token for {member.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <MembershipCard
            member={member}
            branchName={branchName}
            districtName={internalDistrict}
            departments={internalDepartments}
          />
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
