import { supabase } from '@/integrations/supabase/client';
import { Member, FirstTimer } from '@/types/membership';

/* ========================================================================
   1. TYPES & COMMANDS (Client V2)
   ======================================================================== */

export type MemberCommand =
  | 'MEMBER_CREATE'
  | 'MEMBER_UPDATE'
  | 'MEMBER_DELETE'
  | 'MEMBER_BULK_TRANSFER'
  | 'ADMIN_CREATE'
  | 'FIRST_TIMER_CREATE'
  | 'FIRST_TIMER_UPDATE'
  | 'FIRST_TIMER_DELETE'
  | 'FIRST_TIMER_BULK_TRANSFER';

interface CommandRequest<T = any> {
  command: MemberCommand;
  payload: T;
}

interface CommandResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

interface ScopePayload {
  district_id?: string;
  branch_id?: string;
}

/* ========================================================================
   2. INVOKER (Centralized Error Handling)
   ======================================================================== */

async function invokeMemberCommand<TPayload, TResult>(
  request: CommandRequest<TPayload>
): Promise<CommandResponse<TResult>> {
  try {
    console.log(`[MemberOps] Invoking ${request.command}...`);

    const { data, error } = await supabase.functions.invoke(
      'member-operations', // Re-using existing function name
      { body: request }
    );

    if (error) {
      console.error('[MemberOps] Edge Function Error:', error);
      // Handle edge case where error object is returned differently
      const msg =
        error.message || (error.context ? JSON.stringify(error.context) : 'Unknown edge error');
      return { success: false, error: msg };
    }

    // Check if the function itself returned an error envelope
    if (data && data.success === false) {
      console.error('[MemberOps] Logic Error:', data.error);
      return { success: false, error: data.error, details: data.details };
    }

    return data as CommandResponse<TResult>;
  } catch (err: any) {
    console.error('[MemberOps] Network/Client Error:', err);
    return {
      success: false,
      error: err.message || 'Unable to connect to server',
    };
  }
}

/* ========================================================================
   3. MEMBER COMMANDS
   ======================================================================== */

export function createMember(data: Partial<Member> & ScopePayload) {
  return invokeMemberCommand({
    command: 'MEMBER_CREATE',
    payload: data,
  });
}

export function updateMember(id: string, data: Partial<Member>) {
  return invokeMemberCommand({
    command: 'MEMBER_UPDATE',
    payload: { id, data },
  });
}

export function deleteMember(id: string) {
  return invokeMemberCommand({
    command: 'MEMBER_DELETE',
    payload: { id },
  });
}

export function bulkTransferMembers(ids: string[], target_branch_id: string, district_id?: string) {
  return invokeMemberCommand({
    command: 'MEMBER_BULK_TRANSFER',
    payload: { ids, target_branch_id, district_id },
  });
}

/* ========================================================================
   4. ADMIN COMMANDS (New!)
   ======================================================================== */

export interface CreateAdminPayload extends ScopePayload {
  email: string;
  password?: string;
  full_name: string;
  phone: string;
  role: string;
}

export function createAdmin(payload: CreateAdminPayload) {
  return invokeMemberCommand({
    command: 'ADMIN_CREATE',
    payload: payload,
  });
}

/* ========================================================================
   5. FIRST TIMER COMMANDS
   ======================================================================== */

export function createFirstTimer(data: Partial<FirstTimer> & ScopePayload) {
  return invokeMemberCommand({
    command: 'FIRST_TIMER_CREATE',
    payload: data,
  });
}

export function updateFirstTimer(id: string, data: Partial<FirstTimer>) {
  return invokeMemberCommand({
    command: 'FIRST_TIMER_UPDATE',
    payload: { id, data },
  });
}

export function deleteFirstTimer(id: string) {
  return invokeMemberCommand({
    command: 'FIRST_TIMER_DELETE',
    payload: { id },
  });
}

export function bulkTransferFirstTimers(
  ids: string[],
  target_branch_id: string,
  district_id?: string
) {
  return invokeMemberCommand({
    command: 'FIRST_TIMER_BULK_TRANSFER',
    payload: { ids, target_branch_id, district_id },
  });
}

/* ========================================================================
   6. PHOTO RESOLUTION UTILITY
   ======================================================================== */

/**
 * Helper to resolve profile photo URL
 * If the stored value is a path, generate a signed URL; otherwise use as-is
 */
export async function resolveProfilePhotoUrl(photoPath: string | null): Promise<string> {
  if (!photoPath) return '';

  let path = photoPath;

  // If it's a full URL, check if it's our Supabase storage URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Example: https://dewfponmggkwaipooqqs.supabase.co/storage/v1/object/public/profile-photos/member-123.jpg
    const storageInfix = '/storage/v1/object/public/profile-photos/';
    if (path.includes(storageInfix)) {
      path = path.split(storageInfix).pop() || '';
      console.log('Detected public Supabase URL, extracted path:', path);
    } else if (path.startsWith('data:')) {
      // Already handled or separate case
      return path;
    } else {
      // Non-Supabase external URL
      return path;
    }
  }

  // It's a storage path (either original or extracted from URL), generate a signed URL (valid for 24 hours)
  try {
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .createSignedUrl(path, 60 * 60 * 24);

    if (error || !data?.signedUrl) {
      console.warn('Failed to create signed URL for profile photo:', path, error);
      return '';
    }

    return data.signedUrl;
  } catch (err) {
    console.warn('Error creating signed URL:', err);
    return '';
  }
}
