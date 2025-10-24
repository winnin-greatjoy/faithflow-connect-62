import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  DepartmentMember,
  DepartmentStats,
} from '@/types/api';

// Finance API Service
export class FinanceApiService extends BaseApiService {
  constructor() {
    super('finance_records'); // Using existing finance_records table
  }

  // Get finance team members
  async getFinanceMembers(request?: ListRequest): Promise<ApiResult<DepartmentMember[]>> {
    try {
      // Get members assigned to finance department using existing tables
      let query = supabase
        .from('department_assignments')
        .select(`
          *,
          member:members!department_assignments_member_id_fkey(
            id,
            full_name,
            email,
            phone,
            date_joined,
            status,
            assigned_department
          )
        `)
        .eq('status', 'approved'); // Only get approved assignments

      // Apply filters
      if (request?.filters?.search) {
        // Note: Search filtering on joined tables is complex in PostgREST
        // For now, we'll filter after the query
        const searchTerm = request.filters.search.toLowerCase();
        query = query; // Keep the base query
      }

      if (request?.filters?.status) {
        query = (query as any).eq('status', request.filters.status as 'pending' | 'approved' | 'rejected');
      }

      // Apply sorting - avoid sorting on joined table fields
      if (request?.sort) {
        // For now, only sort on department_assignments fields
        if (request.sort.field.startsWith('member.')) {
          query = query.order('assigned_date', { ascending: false });
        } else {
          query = query.order(request.sort.field, { ascending: request.sort.direction === 'asc' });
        }
      } else {
        query = query.order('assigned_date', { ascending: false });
      }

      // Apply pagination
      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Filter results to only include members assigned to finance department
      let filteredData = (data || []).filter(assignment =>
        assignment.member?.assigned_department === 'finance'
      );

      // Apply search filtering on client side
      if (request?.filters?.search) {
        const searchTerm = request.filters.search.toLowerCase();
        filteredData = filteredData.filter(assignment =>
          assignment.member?.full_name?.toLowerCase().includes(searchTerm) ||
          assignment.member?.email?.toLowerCase().includes(searchTerm)
        );
      }

      // Transform data to DepartmentMember format with finance-specific fields
      const financeMembers: DepartmentMember[] = filteredData.map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        // Include all required fields from DepartmentAssignmentRow
        approved_by: assignment.approved_by,
        approved_date: assignment.approved_date,
        assigned_by: assignment.assigned_by,
        created_at: assignment.created_at,
        reason: assignment.reason,
        type: assignment.type,
        updated_at: assignment.updated_at,
        // Finance-specific fields
        specialization: 'Budgeting', // Would come from extended profile
        transactions_processed: 245, // Would be calculated from finance_records
        accuracy_rate: 99.8, // Would be calculated from transaction history
        certifications: ['CPA', 'QuickBooks Certified'], // Would come from certifications table
        access_level: 'admin', // Would come from user roles
      }));

      return { data: financeMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get financial transactions (using finance_records table)
  async getTransactions(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      let query: any = supabase
        .from('finance_records' as any)
        .select('*')
        .order('transaction_date', { ascending: false }) as any;

      // Apply filters
      if (request?.filters?.search) {
        query = query.or(`description.ilike.%${request.filters.search}%,category.ilike.%${request.filters.search}%`);
      }

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status as 'pending' | 'approved' | 'rejected');
      }

      if (request?.filters?.category) {
        query = query.eq('category', request.filters.category);
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform to financial transaction format
      const transactions = (data || []).map(record => ({
        id: record.id,
        type: record.type as 'income' | 'expense',
        category: record.category,
        subcategory: null, // Not in current schema
        description: record.description || '',
        amount: record.amount,
        transaction_date: record.transaction_date,
        recorded_by: record.recorded_by || 'system',
        approved_by: null, // Not in current schema
        status: 'completed', // Default status since not in current schema
        receipt_url: null, // Not in current schema
        notes: null, // Not in current schema
        member_id: record.member_id,
        event_id: null, // Not in current schema
        branch_id: record.branch_id,
      }));

      return { data: transactions, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create financial transaction (using finance_records table)
  async createTransaction(transactionData: {
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
    transaction_date: string;
    member_id?: string;
    event_id?: string;
    receipt_url?: string;
    notes?: string;
  }): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from('finance_records')
        .insert({
          type: transactionData.type,
          category: transactionData.category,
          description: transactionData.description,
          amount: transactionData.amount,
          transaction_date: transactionData.transaction_date,
          member_id: transactionData.member_id,
          branch_id: 'main-branch-id', // Should be actual branch ID
          recorded_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to financial transaction format
      const transaction = {
        id: data.id,
        type: data.type as 'income' | 'expense',
        category: data.category,
        subcategory: null,
        description: data.description || '',
        amount: data.amount,
        transaction_date: data.transaction_date,
        recorded_by: data.recorded_by || 'system',
        approved_by: null,
        status: 'completed', // Default status
        receipt_url: null,
        notes: null,
        member_id: data.member_id,
        event_id: null,
        branch_id: data.branch_id,
      };

      return { data: transaction, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Approve transaction (using finance_records table)
  async approveTransaction(
    transactionId: string,
    approvedBy: string
  ): Promise<ApiResult<any>> {
    try {
      // Update the record with approval info (using description field for now)
      const { data, error } = await supabase
        .from('finance_records')
        .update({
          description: `Approved by: ${approvedBy}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      // Transform back to financial transaction format
      const transaction = {
        id: data.id,
        type: data.type as 'income' | 'expense',
        category: data.category,
        subcategory: null,
        description: data.description || '',
        amount: data.amount,
        transaction_date: data.transaction_date,
        recorded_by: data.recorded_by || 'system',
        approved_by: approvedBy,
        status: 'completed', // Since we approved it
        receipt_url: null,
        notes: null,
        member_id: data.member_id,
        event_id: null,
        branch_id: data.branch_id,
      };

      return { data: transaction, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get budget categories (mock data for now since no budget_categories table exists)
  async getBudgetCategories(): Promise<ApiResult<any[]>> {
    try {
      // Return mock budget categories data since we don't have a budget_categories table yet
      const categories = [
        {
          id: '1',
          name: 'Staff Salaries',
          description: 'Monthly staff compensation',
          budgeted_amount: 6000,
          spent_amount: 6000,
          remaining_amount: 0,
          percentage_used: 100,
          status: 'on_budget',
          branch_id: 'current-branch-id',
        },
        {
          id: '2',
          name: 'Building Maintenance',
          description: 'Property upkeep and repairs',
          budgeted_amount: 2000,
          spent_amount: 2100,
          remaining_amount: -100,
          percentage_used: 105,
          status: 'over_budget',
          branch_id: 'current-branch-id',
        },
        {
          id: '3',
          name: 'Ministry Programs',
          description: 'Department and ministry activities',
          budgeted_amount: 1500,
          spent_amount: 800,
          remaining_amount: 700,
          percentage_used: 53,
          status: 'under_budget',
          branch_id: 'current-branch-id',
        },
      ];

      return { data: categories, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get financial summary (using finance_records table)
  async getFinancialSummary(
    startDate: string,
    endDate: string
  ): Promise<ApiResult<{
    total_income: number;
    total_expenses: number;
    net_income: number;
    transaction_count: number;
    pending_approvals: number;
  }>> {
    try {
      const { data: income } = await supabase
        .from('finance_records')
        .select('amount')
        .eq('type', 'income')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      const { data: expenses } = await supabase
        .from('finance_records')
        .select('amount')
        .eq('type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      const totalIncome = income?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const totalExpenses = Math.abs(expenses?.reduce((sum, record) => sum + record.amount, 0) || 0);

      return {
        data: {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          net_income: totalIncome - totalExpenses,
          transaction_count: (income?.length || 0) + (expenses?.length || 0),
          pending_approvals: 0, // No pending status in current schema
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get finance statistics
  async getFinanceStats(): Promise<ApiResult<DepartmentStats>> {
    try {
      // Get member counts from members table where assigned_department = 'finance'
      const { data: totalMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'finance');

      const { data: activeMembers } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('assigned_department', 'finance')
        .eq('status', 'active');

      // Get finance records count (proxy for completed activities)
      const { data: transactions } = await supabase
        .from('finance_records')
        .select('id', { count: 'exact' });

      // Calculate monthly growth (placeholder)
      const monthlyGrowth = 12;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents: 3, // Budget reviews, audits, etc.
        completedActivities: transactions?.length || 0,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

export const financeApi = new FinanceApiService();
