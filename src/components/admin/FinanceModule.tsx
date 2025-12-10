import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminContext } from '@/context/AdminContext';
import { useAuthz } from '@/hooks/useAuthz';

type FinanceRecord = {
  id: string;
  date: string;
  donor: string;
  amount: number;
  method: string;
  type: string;
};

export const FinanceModule = () => {
  const { selectedBranchId } = useAdminContext();
  const { branchId: authBranchId, hasRole } = useAuthz();
  const isSuperadmin = hasRole('super_admin');
  const effectiveBranchId = isSuperadmin ? selectedBranchId : authBranchId;

  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [stats, setStats] = useState({
    monthlyGiving: 0,
    weeklyAverage: 0,
    expenses: 0,
    monthlyChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [branchName, setBranchName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build query with branch filter
        let query = supabase
          .from('finance_records')
          .select(`
            id,
            transaction_date,
            amount,
            type,
            category,
            description,
            member_id,
            members (full_name)
          `)
          .order('transaction_date', { ascending: false })
          .limit(10);

        if (effectiveBranchId) {
          query = query.eq('branch_id', effectiveBranchId);
          
          // Fetch branch name
          const { data: branchData } = await supabase
            .from('church_branches')
            .select('name')
            .eq('id', effectiveBranchId)
            .single();
          if (branchData) setBranchName(branchData.name);
        } else {
          setBranchName('All Branches');
        }

        const { data, error } = await query;

        if (error) throw error;

        const mapped: FinanceRecord[] = (data || []).map((r: any) => ({
          id: r.id,
          date: r.transaction_date,
          donor: r.members?.full_name || 'Anonymous',
          amount: r.amount,
          method: r.category || 'Cash',
          type: r.type,
        }));
        setRecords(mapped);

        // Calculate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Get all records for stats calculation
        let statsQuery = supabase
          .from('finance_records')
          .select('amount, type, transaction_date');
        if (effectiveBranchId) {
          statsQuery = statsQuery.eq('branch_id', effectiveBranchId);
        }
        const { data: allRecords } = await statsQuery;

        const income = (allRecords || [])
          .filter((r: any) => {
            const d = new Date(r.transaction_date);
            return r.type === 'income' && d >= startOfMonth;
          })
          .reduce((sum: number, r: any) => sum + Number(r.amount), 0);

        const lastMonthIncome = (allRecords || [])
          .filter((r: any) => {
            const d = new Date(r.transaction_date);
            return r.type === 'income' && d >= startOfLastMonth && d < startOfMonth;
          })
          .reduce((sum: number, r: any) => sum + Number(r.amount), 0);

        const expenses = (allRecords || [])
          .filter((r: any) => {
            const d = new Date(r.transaction_date);
            return r.type === 'expense' && d >= startOfMonth;
          })
          .reduce((sum: number, r: any) => sum + Number(r.amount), 0);

        const change = lastMonthIncome > 0 
          ? Math.round(((income - lastMonthIncome) / lastMonthIncome) * 100) 
          : 0;

        setStats({
          monthlyGiving: income,
          weeklyAverage: Math.round(income / 4),
          expenses,
          monthlyChange: change,
        });
      } catch (error) {
        console.error('Error fetching finance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [effectiveBranchId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Track donations, expenses, and financial reports{branchName ? ` for ${branchName}` : ''}.
          </p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Export Financial Report</span>
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Monthly Giving</CardTitle>
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.monthlyGiving)}
            </div>
            <div className={`flex items-center text-xs mt-1 ${stats.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.monthlyChange >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {stats.monthlyChange >= 0 ? '+' : ''}{stats.monthlyChange}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Weekly Average</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.weeklyAverage)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Based on current month
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-lg sm:text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.expenses)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              This month's expenses
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Latest financial activities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Donor</TableHead>
                  <TableHead className="text-xs sm:text-sm text-right">Amount</TableHead>
                  <TableHead className="text-xs sm:text-sm">Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-xs sm:text-sm">{record.date}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{record.donor}</TableCell>
                      <TableCell className={`text-xs sm:text-sm text-right font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className="text-xs">
                          {record.method}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
