import { supabase } from '@/integrations/supabase/client';
import { BaseApiService } from '@/utils/api';
import type {
  ApiResult,
  ListRequest,
  FinanceMember,
  FinancialTransaction,
  BudgetCategory,
  DepartmentStats,
} from '@/types/api';

// Finance API Service
export class FinanceApiService extends BaseApiService {
  constructor() {
    super('finance_records');
  }

  // Get finance team members
  async getFinanceMembers(request?: ListRequest): Promise<ApiResult<FinanceMember[]>> {
    try {
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
            status
          )
        `)
        .eq('department_id', 'finance-department-id');

      if (request?.filters?.search) {
        query = query.or(`member.full_name.ilike.%${request.filters.search}%,member.email.ilike.%${request.filters.search}%`);
      }

      if (request?.sort) {
        query = query.order(request.sort.field, { ascending: request.sort.direction === 'asc' });
      } else {
        query = query.order('assigned_date', { ascending: false });
      }

      if (request?.pagination) {
        const offset = (request.pagination.page - 1) * request.pagination.limit;
        query = query.range(offset, offset + request.pagination.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      const financeMembers: FinanceMember[] = (data || []).map(assignment => ({
        id: assignment.id,
        member_id: assignment.member_id,
        department_id: assignment.department_id,
        assigned_date: assignment.assigned_date,
        status: assignment.status,
        member: assignment.member,
        specialization: 'Budgeting',
        transactions_processed: 245,
        accuracy_rate: 99.8,
        certifications: ['CPA', 'QuickBooks Certified'],
        access_level: 'admin',
      }));

      return { data: financeMembers, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get financial transactions
  async getTransactions(request?: ListRequest): Promise<ApiResult<FinancialTransaction[]>> {
    try {
      let query = supabase
        .from('finance_records')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (request?.filters?.search) {
        query = query.or(`description.ilike.%${request.filters.search}%,category.ilike.%${request.filters.search}%`);
      }

      if (request?.filters?.status) {
        query = query.eq('status', request.filters.status);
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

      return { data: data as FinancialTransaction[] || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Create financial transaction
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
  }): Promise<ApiResult<FinancialTransaction>> {
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
          event_id: transactionData.event_id,
          receipt_url: transactionData.receipt_url,
          notes: transactionData.notes,
          branch_id: 'current-branch-id', // Would get from context
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as FinancialTransaction, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Approve transaction
  async approveTransaction(
    transactionId: string,
    approvedBy: string
  ): Promise<ApiResult<FinancialTransaction>> {
    try {
      const { data, error } = await supabase
        .from('finance_records')
        .update({
          status: 'approved',
          approved_by: approvedBy,
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data as FinancialTransaction, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get budget categories
  async getBudgetCategories(): Promise<ApiResult<BudgetCategory[]>> {
    try {
      // This would query a budget_categories table
      const categories: BudgetCategory[] = [
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

  // Get financial summary
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

      const { data: pending } = await supabase
        .from('finance_records')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      const totalIncome = income?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const totalExpenses = Math.abs(expenses?.reduce((sum, record) => sum + record.amount, 0) || 0);

      return {
        data: {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          net_income: totalIncome - totalExpenses,
          transaction_count: (income?.length || 0) + (expenses?.length || 0),
          pending_approvals: pending?.length || 0,
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
      const { data: totalMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'finance-department-id')
        .eq('status', 'approved');

      const { data: activeMembers } = await supabase
        .from('department_assignments')
        .select('member_id', { count: 'exact' })
        .eq('department_id', 'finance-department-id')
        .eq('status', 'approved')
        .eq('member.status', 'active');

      const upcomingEvents = 3; // Budget reviews, audits, etc.
      const completedActivities = 45; // Transactions processed
      const monthlyGrowth = 12;

      const stats: DepartmentStats = {
        totalMembers: totalMembers?.length || 0,
        activeMembers: activeMembers?.length || 0,
        upcomingEvents,
        completedActivities,
        monthlyGrowth,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

export const financeApi = new FinanceApiService();
