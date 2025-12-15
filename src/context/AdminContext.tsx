import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthz } from '@/hooks/useAuthz';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
  branchName: string | null;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({
  children,
  initialBranchId,
}: {
  children: ReactNode;
  initialBranchId?: string;
}) => {
  const { branchId: userBranchId, hasRole, loading: authLoading } = useAuthz();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperadmin = hasRole('super_admin');

  useEffect(() => {
    if (authLoading) return;

    const initializeContext = async () => {
      setLoading(true);

      // 1. If explicitly initialized (e.g. Portal Mode), use that
      if (initialBranchId) {
        setSelectedBranchId(initialBranchId);
      }
      // 2. If NOT superadmin, always enforce their assigned branch
      else if (!isSuperadmin) {
        if (userBranchId && selectedBranchId !== userBranchId) {
          setSelectedBranchId(userBranchId);
        }
      } else {
        // 3. If superadmin, selectedBranchId persists.
        // If they have a "home" branch assigned and nothing selected, default to it.
        if (!selectedBranchId && userBranchId) {
          setSelectedBranchId(userBranchId);
        }

        // If still no branch selected (Global View), clear branch name
        if (!selectedBranchId && !userBranchId) {
          setBranchName(null);
        }
      }
      setLoading(false);
    };

    initializeContext();
  }, [authLoading, isSuperadmin, userBranchId, selectedBranchId, initialBranchId]);

  // Effect to fetch branch name when selectedBranchId changes
  useEffect(() => {
    const fetchBranchName = async () => {
      if (!selectedBranchId) {
        setBranchName(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('church_branches')
          .select('name')
          .eq('id', selectedBranchId)
          .maybeSingle();

        if (data) {
          setBranchName(data.name);
        }
      } catch (error) {
        console.error('Error fetching branch name:', error);
      }
    };
    fetchBranchName();
  }, [selectedBranchId]);

  const value = {
    selectedBranchId,
    setSelectedBranchId: (id: string | null) => {
      // Security check: Only superadmins can change this freely.
      // Regular admins are locked to their userBranchId by the effect above,
      // but let's prevent programmatic misuse too.
      if (isSuperadmin) {
        setSelectedBranchId(id);
      } else if (id === userBranchId) {
        setSelectedBranchId(id);
      } else {
        console.warn('Attempted to set branch ID mismatch for non-superadmin');
      }
    },
    branchName,
    loading: loading || authLoading,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};
