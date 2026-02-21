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
  allowed_groups?: string[];
  allowed_users?: string[];
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

export type StreamQA = {
  id: string;
  stream_id: string;
  user_id?: string;
  question: string;
  upvotes: string[];
  is_answered: boolean;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    profile_photo?: string;
  };
};

export type StreamPoll = {
  id: string;
  stream_id: string;
  question: string;
  options: { text: string }[];
  status: 'draft' | 'active' | 'ended';
  created_at: string;
  votes?: StreamPollVote[];
};

export type StreamPollVote = {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
  created_at: string;
};

const STREAM_SAFE_SELECT =
  'id,title,description,thumbnail_url,video_url,storage_path,platform,embed_url,privacy,status,start_time,end_time,branch_id,created_by,created_at,updated_at,category,view_count,is_featured';

export const streamingApi = {
  // Get admin-only credentials (rtmp_server, stream_key) via Edge Function
  async getAdminCredentials(
    streamId: string
  ): Promise<ApiResult<{ stream_key?: string; rtmp_server?: string }>> {
    try {
      const { data, error }: any = await (supabase as any).functions.invoke('stream-admin', {
        body: { action: 'get_credentials', streamId },
      });
      if (error) return handleApiError(error);
      return createApiResponse({ stream_key: data?.stream_key, rtmp_server: data?.rtmp_server });
    } catch (error) {
      return handleApiError(error);
    }
  },
  // Get all streams
  async list(filters?: {
    status?: Stream['status'];
    privacy?: Stream['privacy'];
    branch_id?: string;
  }): Promise<ApiResult<Stream[]>> {
    try {
      let query = supabase
        .from('streams')
        .select(STREAM_SAFE_SELECT)
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
        .select(STREAM_SAFE_SELECT)
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
  async create(
    stream: Omit<Stream, 'id' | 'created_at' | 'updated_at' | 'view_count'>
  ): Promise<ApiResult<Stream>> {
    try {
      const { data, error } = await supabase
        .from('streams')
        .insert([stream as any])
        .select(STREAM_SAFE_SELECT)
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
        .select(STREAM_SAFE_SELECT)
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
      const { error } = await supabase.from('streams').delete().eq('id', id);

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('stream_views').insert([
        {
          stream_id: streamId,
          user_id: user?.id,
          watch_duration: watchDuration,
        },
      ]);

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
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          try {
            const inserted = payload.new as any;
            // Re-fetch with joined user profile so UI can render names/avatars.
            const { data } = await supabase
              .from('stream_chats')
              .select('*, user:profiles(first_name, last_name, profile_photo)')
              .eq('id', inserted.id)
              .maybeSingle();
            callback((data || inserted) as StreamChat);
          } catch {
            callback(payload.new as StreamChat);
          }
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
        body: { streamId },
      });
      if (error) {
        return handleApiError(error);
      }
      const url = (data as any)?.url ?? null;
      return createApiResponse(url);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete a chat message (moderation)
  async deleteChat(chatId: string): Promise<ApiResult<void>> {
    try {
      const { error } = await supabase.from('stream_chats').delete().eq('id', chatId);
      if (error) return handleApiError(error);
      return createApiResponse(undefined as any);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Regenerate stream key (client-side update, relies on RLS for privileged roles)
  async regenerateStreamKey(streamId: string): Promise<ApiResult<Stream>> {
    try {
      // Prefer Edge Function so we can return the key despite column-level restrictions
      const invoke: any = await (supabase as any).functions.invoke('stream-admin', {
        body: { action: 'regenerate_key', streamId },
      });
      if (invoke?.error) return handleApiError(invoke.error);
      const newKey = invoke?.data?.stream_key as string | undefined;
      // Fetch latest stream (does not include restricted columns)
      const latest = await this.get(streamId);
      const creds = await this.getAdminCredentials(streamId);
      if (!latest.error) {
        const withKey = {
          ...(latest.data as any),
          ...(creds.error ? {} : (creds.data as any)),
          stream_key: newKey,
        } as Stream;
        return createApiResponse(withKey);
      }
      // Fallback to returning minimal object if fetch failed
      return createApiResponse({
        id: streamId,
        ...(creds.error ? {} : (creds.data as any)),
        stream_key: newKey,
      } as any as Stream);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Access Control Management
  async addAllowedGroup(streamId: string, groupId: string): Promise<ApiResult<void>> {
    try {
      const { error } = await (supabase as any)
        .from('stream_allowed_groups')
        .insert([{ stream_id: streamId, group_id: groupId }]);
      if (error) return handleApiError(error);
      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async removeAllowedGroup(streamId: string, groupId: string): Promise<ApiResult<void>> {
    try {
      const { error } = await (supabase as any)
        .from('stream_allowed_groups')
        .delete()
        .eq('stream_id', streamId)
        .eq('group_id', groupId);
      if (error) return handleApiError(error);
      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async addAllowedUser(streamId: string, userId: string): Promise<ApiResult<void>> {
    try {
      const { error } = await (supabase as any)
        .from('stream_allowed_users')
        .insert([{ stream_id: streamId, user_id: userId }]);
      if (error) return handleApiError(error);
      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async removeAllowedUser(streamId: string, userId: string): Promise<ApiResult<void>> {
    try {
      const { error } = await (supabase as any)
        .from('stream_allowed_users')
        .delete()
        .eq('stream_id', streamId)
        .eq('user_id', userId);
      if (error) return handleApiError(error);
      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async listAllowedAccess(streamId: string): Promise<
    ApiResult<{
      groups: any[];
      users: any[];
    }>
  > {
    try {
      const { data: groups, error: gError } = await (supabase as any)
        .from('stream_allowed_groups')
        .select('*, group:groups(name)')
        .eq('stream_id', streamId);

      const { data: users, error: uError } = await (supabase as any)
        .from('stream_allowed_users')
        .select('*, user:profiles(first_name, last_name)')
        .eq('stream_id', streamId);

      if (gError) return handleApiError(gError);
      if (uError) return handleApiError(uError);

      return createApiResponse({ groups: groups || [], users: users || [] });
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Q&A Methods
  async getQA(streamId: string): Promise<ApiResult<StreamQA[]>> {
    try {
      const { data, error } = await (supabase as any)
        .from('stream_qa')
        .select('*, user:profiles(first_name, last_name, profile_photo)')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: false });
      if (error) return handleApiError(error);
      return createApiResponse(data as any);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async askQuestion(streamId: string, question: string): Promise<ApiResult<StreamQA>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any)
        .from('stream_qa')
        .insert([{ stream_id: streamId, user_id: user?.id, question }])
        .select()
        .single();
      if (error) return handleApiError(error);
      return createApiResponse(data as StreamQA);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async toggleAnswered(questionId: string, isAnswered: boolean): Promise<ApiResult<void>> {
    try {
      const { error } = await (supabase as any)
        .from('stream_qa')
        .update({ is_answered: isAnswered })
        .eq('id', questionId);
      if (error) return handleApiError(error);
      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async upvoteQuestion(questionId: string, userId: string): Promise<ApiResult<void>> {
    try {
      const { data: qa }: any = await (supabase as any)
        .from('stream_qa')
        .select('upvotes')
        .eq('id', questionId)
        .single();
      if (!qa) return handleApiError(new Error('Question not found'));

      const upvotes = qa.upvotes || [];
      const newUpvotes = upvotes.includes(userId)
        ? upvotes.filter((id: string) => id !== userId)
        : [...upvotes, userId];

      const { error } = await (supabase as any)
        .from('stream_qa')
        .update({ upvotes: newUpvotes })
        .eq('id', questionId);
      if (error) return handleApiError(error);
      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  subscribeToQA(streamId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`stream-qa-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stream_qa',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await (supabase as any)
              .from('stream_qa')
              .select('*, user:profiles(first_name, last_name, profile_photo)')
              .eq('id', payload.new.id)
              .maybeSingle();
            callback({ ...payload, new: data || payload.new });
          } else {
            callback(payload);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },

  // Poll Methods
  async getPolls(streamId: string): Promise<ApiResult<StreamPoll[]>> {
    try {
      const { data, error } = await (supabase as any)
        .from('stream_polls')
        .select('*, votes:stream_poll_votes(*)')
        .eq('stream_id', streamId)
        .order('created_at', { ascending: false });
      if (error) return handleApiError(error);
      return createApiResponse(data as any);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createPoll(
    streamId: string,
    question: string,
    options: string[]
  ): Promise<ApiResult<StreamPoll>> {
    try {
      const { data, error } = await (supabase as any)
        .from('stream_polls')
        .insert([
          {
            stream_id: streamId,
            question,
            options: options.map((opt) => ({ text: opt })),
            status: 'draft',
          },
        ])
        .select()
        .single();
      if (error) return handleApiError(error);
      return createApiResponse(data as StreamPoll);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updatePollStatus(pollId: string, status: StreamPoll['status']): Promise<ApiResult<void>> {
    try {
      const { error } = await (supabase as any)
        .from('stream_polls')
        .update({ status })
        .eq('id', pollId);
      if (error) return handleApiError(error);
      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async submitVote(pollId: string, optionIndex: number): Promise<ApiResult<void>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return handleApiError(new Error('Auth required'));

      const { error } = await (supabase as any)
        .from('stream_poll_votes')
        .upsert([{ poll_id: pollId, user_id: user.id, option_index: optionIndex }], {
          onConflict: 'poll_id,user_id',
        });
      if (error) return handleApiError(error);
      return createApiResponse(undefined);
    } catch (error) {
      return handleApiError(error);
    }
  },

  subscribeToPolls(streamId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`stream-polls-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stream_polls',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          const { data } = await (supabase as any)
            .from('stream_polls')
            .select('*, votes:stream_poll_votes(*)')
            .eq('id', payload.new?.id || (payload.old as any)?.id)
            .maybeSingle();
          callback({ ...payload, new: data || payload.new });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stream_poll_votes',
        },
        async (payload) => {
          // Poll votes affect the whole poll data
          const pollId = (payload.new as any)?.poll_id || (payload.old as any)?.poll_id;
          if (pollId) {
            const { data } = await (supabase as any)
              .from('stream_polls')
              .select('*, votes:stream_poll_votes(*)')
              .eq('id', pollId)
              .maybeSingle();
            callback({ eventType: 'UPDATE', new: data });
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
