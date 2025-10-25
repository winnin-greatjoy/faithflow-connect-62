import { supabase } from '@/integrations/supabase/client';
import { createApiResponse, handleApiError } from '@/utils/api';
import type { ApiResult } from '@/types/api';
import type { Database } from '@/integrations/supabase/types';

export type ProvisioningJob = Database['public']['Tables']['account_provisioning_jobs']['Row'] & {
  member?: { id: string; full_name: string; email: string | null; profile_photo: string | null; status: Database['public']['Enums']['member_status'] | null };
};

export const provisioningApi = {
  async list(limit = 50): Promise<ApiResult<ProvisioningJob[]>> {
    try {
      const { data, error } = await supabase
        .from('account_provisioning_jobs')
        .select('*, member:members (id, full_name, email, profile_photo, status)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse((data as unknown as ProvisioningJob[]) || []);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async retry(jobId: string): Promise<ApiResult<ProvisioningJob>> {
    try {
      const { data, error } = await supabase
        .from('account_provisioning_jobs')
        .update({ status: 'pending', reason: null, processed_at: null })
        .eq('id', jobId)
        .select('*')
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data as unknown as ProvisioningJob);
    } catch (error) {
      return handleApiError(error);
    }
  }
  ,
  async create(
    memberId: string,
    type: ProvisioningJob['type'] = 'admin_initiated',
    delivery_method: 'invite' | 'temp_password' = 'invite'
  ): Promise<ApiResult<ProvisioningJob>> {
    try {
      const { data, error } = await supabase
        .from('account_provisioning_jobs')
        .insert({ member_id: memberId, type, delivery_method })
        .select('*')
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data as unknown as ProvisioningJob);
    } catch (error) {
      return handleApiError(error);
    }
  }
};
