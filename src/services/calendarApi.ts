
import { supabase } from '@/integrations/supabase/client';

// Types
export interface UserTask {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    due_date?: string;
    is_completed: boolean;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
}

export interface Appointment {
    id: string;
    host_id: string;
    requester_id: string;
    start_at: string;
    end_at: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    notes?: string;
    created_at: string;
    host?: { full_name: string };
    requester?: { full_name: string };
}

export interface AppointmentSlot {
    id: string;
    host_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    duration_minutes: number;
}

// Tasks API
export const tasksApi = {
    async getMyTasks() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'Not authenticated' };

        return await supabase
            .from('user_tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true });
    },

    async createTask(task: Partial<UserTask>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        return supabase
            .from('user_tasks')
            .insert([{ ...task, user_id: user.id }] as any)
            .select()
            .single();
    },

    async updateTask(id: string, updates: Partial<UserTask>) {
        return await supabase
            .from('user_tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
    },

    async deleteTask(id: string) {
        return await supabase
            .from('user_tasks')
            .delete()
            .eq('id', id);
    }
};

// Appointments API
export const appointmentsApi = {
    async getMyAppointments() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'Not authenticated' };

        // Fetch appointments where user is either host or requester
        // We also want to fetch details of the "other" party
        const { data, error } = await supabase
            .from('appointments')
            .select(`
        *,
        host:host_id(full_name),
        requester:requester_id(full_name)
      `)
            .or(`host_id.eq.${user.id},requester_id.eq.${user.id}`)
            .order('start_at', { ascending: true });

        return { data: data as any, error };
    },

    async createAppointment(appt: Partial<Appointment>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        return await supabase
            .from('appointments')
            .insert([{ ...appt, requester_id: user.id }] as any)
            .select()
            .single();
    },

    async updateStatus(id: string, status: Appointment['status']) {
        return await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
    },

    // Slots
    async getSlots(hostId: string) {
        return await supabase
            .from('appointment_slots')
            .select('*')
            .eq('host_id', hostId);
    }
};
