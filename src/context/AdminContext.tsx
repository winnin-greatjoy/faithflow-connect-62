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
  const { userId, branchId: userBranchId, hasRole, loading: authLoading } = useAuthz();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [districtAdminDistrictId, setDistrictAdminDistrictId] = useState<string | null>(null);
  const [districtAdminBranchIds, setDistrictAdminBranchIds] = useState<string[] | null>(null);
  const [districtScopeLoading, setDistrictScopeLoading] = useState(false);

  const isSuperadmin = hasRole('super_admin');
  const isDistrictAdmin = hasRole('district_admin');

  useEffect(() => {
    if (authLoading) return;
    if (!userId) return;

    if (!isDistrictAdmin || isSuperadmin) {
      setDistrictAdminDistrictId(null);
      setDistrictAdminBranchIds(null);
      return;
    }

    let active = true;
    (async () => {
      setDistrictScopeLoading(true);
      try {
        const { data: district } = await supabase
          .from('districts')
          .select('id')
          .eq('head_admin_id', userId)
          .maybeSingle();

        if (!active) return;
        const did = district?.id ?? null;
        setDistrictAdminDistrictId(did);

        if (!did) {
          setDistrictAdminBranchIds([]);
          return;
        }

        const { data: branches } = await supabase
          .from('church_branches')
          .select('id')
          .eq('district_id', did);

        if (!active) return;
        setDistrictAdminBranchIds((branches || []).map((b) => b.id));
      } finally {
        if (active) setDistrictScopeLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authLoading, userId, isDistrictAdmin, isSuperadmin]);

  useEffect(() => {
    if (authLoading) return;

    // If we're a district admin, we need district scope info before we can safely accept initialBranchId
    if (isDistrictAdmin && !isSuperadmin && districtScopeLoading) return;

    const initializeContext = async () => {
      setLoading(true);

      // 1. If explicitly initialized (e.g. Portal Mode), validate based on role
      if (initialBranchId) {
        if (isSuperadmin) {
          setSelectedBranchId(initialBranchId);
        } else if (isDistrictAdmin) {
          const allowed = (districtAdminBranchIds || []).includes(initialBranchId);
          if (allowed) {
            setSelectedBranchId(initialBranchId);
          } else if (userBranchId) {
            setSelectedBranchId(userBranchId);
          } else {
            setSelectedBranchId(null);
          }
        } else if (userBranchId && initialBranchId === userBranchId) {
          setSelectedBranchId(initialBranchId);
        } else if (userBranchId) {
          setSelectedBranchId(userBranchId);
        } else {
          setSelectedBranchId(null);
        }
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
  }, [
    authLoading,
    isSuperadmin,
    isDistrictAdmin,
    userBranchId,
    selectedBranchId,
    initialBranchId,
    districtAdminBranchIds,
    districtScopeLoading,
  ]);

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
  // Return safe defaults when used outside AdminProvider (e.g., in portal)
  if (context === undefined) {
    return {
      selectedBranchId: null,
      setSelectedBranchId: () => { },
      branchName: null,
      loading: false,
    } as AdminContextType;
  }
  return context;
};
