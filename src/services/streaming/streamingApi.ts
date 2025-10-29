import { supabase } from '@/integrations/supabase/client';
import { createApiResponse, handleApiError } from '@/utils/api';
import type { ApiResult } from '@/types/api';

export type Stream = {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  storage_path?: string;
  platform: 'youtube' | 'facebook' | 'vimeo' | 'custom' | 'supabase';
  embed_url?: string;
  stream_key?: string;
  rtmp_server?: string;
  privacy: 'public' | 'members_only' | 'private';
  status: 'scheduled' | 'live' | 'ended' | 'archived';
  start_time?: string;
  end_time?: string;
  branch_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: string;
  view_count: number;
  is_featured: boolean;
};

export type StreamChat = {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    profile_photo?: string;
  };
};

export const streamingApi = {
  // Get all streams
  async list(filters?: {
    status?: Stream['status'];
    privacy?: Stream['privacy'];
    branch_id?: string;
  }): Promise<ApiResult<Stream[]>> {
    try {
      let query = supabase
        .from('streams')
        .select('*')
        .order('start_time', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.privacy) {
        query = query.eq('privacy', filters.privacy);
      }
      if (filters?.branch_id) {
        query = query.eq('branch_id', filters.branch_id);
      }

      const { data, error } = await query;

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data as Stream[]);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get single stream
  async get(id: string): Promise<ApiResult<Stream>> {
    try {
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data as Stream);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create stream
  async create(stream: Omit<Stream, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<ApiResult<Stream>> {
    try {
      const { data, error } = await supabase
        .from('streams')
        .insert([stream as any])
        .select()
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data as Stream);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update stream
  async update(id: string, updates: Partial<Stream>): Promise<ApiResult<Stream>> {
    try {
      const { data, error } = await supabase
        .from('streams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data as Stream);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete stream
  async delete(id: string): Promise<ApiResult<void>> {
    try {
      const { error } = await supabase
        .from('streams')
        .delete()
        .eq('id', id);

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get stream chats
  async getChats(streamId: string): Promise<ApiResult<StreamChat[]>> {
    try {
      const { data, error } = await supabase
        .from('stream_chats')
        .select('*, user:profiles(first_name, last_name, profile_photo)')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: true });

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data as any);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Send chat message
  async sendChat(streamId: string, message: string): Promise<ApiResult<StreamChat>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return handleApiError(new Error('User not authenticated'));
      }

      const { data, error } = await supabase
        .from('stream_chats')
        .insert([{ stream_id: streamId, user_id: user.id, message }])
        .select()
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data as StreamChat);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Log stream view
  async logView(streamId: string, watchDuration: number = 0): Promise<ApiResult<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('stream_views')
        .insert([{ 
          stream_id: streamId, 
          user_id: user?.id, 
          watch_duration: watchDuration 
        }]);

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Subscribe to chat messages
  subscribeToChat(streamId: string, callback: (message: StreamChat) => void) {
    const channel = supabase
      .channel(`stream-chat-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_chats',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          callback(payload.new as StreamChat);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Get signed or direct playback URL via Edge Function
  async getPlaybackUrl(streamId: string): Promise<ApiResult<string | null>> {
    try {
      const { data, error }: any = await (supabase as any).functions.invoke('stream-playback-url', {
        body: { streamId }
      });
      if (error) {
        return handleApiError(error);
      }
      const url = (data as any)?.url ?? null;
      return createApiResponse(url);
    } catch (error) {
      return handleApiError(error);
    }
  }
};
