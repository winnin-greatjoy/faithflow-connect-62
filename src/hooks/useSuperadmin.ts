import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SuperadminStatus {
  isSuperadmin: boolean;
  loading: boolean;
}

/**
 * Custom hook to check if the current user has superadmin role
 * @returns {SuperadminStatus} Object containing isSuperadmin boolean and loading state
 */
export const useSuperadmin = (): SuperadminStatus => {
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSuperadminStatus = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsSuperadmin(false);
          setLoading(false);
          return;
        }

        // Check if user has super_admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'super_admin')
          .single();

        if (error) {
          // If no super_admin role found, error is expected
          setIsSuperadmin(false);
        } else {
          setIsSuperadmin(!!data);
        }
      } catch (error) {
        console.error('Error checking superadmin status:', error);
        setIsSuperadmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperadminStatus();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkSuperadminStatus();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isSuperadmin, loading };
};
