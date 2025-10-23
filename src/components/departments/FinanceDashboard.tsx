import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  DollarSign,
  CreditCard,
  PiggyBank,
  UserPlus,
  FileText,
  Settings,
  Eye,
  Edit,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Receipt,
  TrendingDown,
  Calculator
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FinanceMember {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  email?: string;
  phone?: string;
  specialization: string;
  transactionsProcessed: number;
  accuracyRate: number;
}

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  receipt?: string;
}

interface BudgetItem {
  id: number;
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'on-track' | 'over';
}

// Mock data for Finance department
const mockFinanceStats = {
  totalMembers: 5,
  activeMembers: 5,
  monthlyIncome: 12500,
  monthlyExpenses: 8200,
  monthlyGrowth: 12,
  budgetUtilization: 68,
  pendingApprovals: 3
};

const mockFinanceMembers: FinanceMember[] = [
  { id: 1, name: 'David Brown', role: 'Finance Director', status: 'active', joinDate: '2019-01-15', email: 'david@example.com', phone: '555-0401', specialization: 'Budgeting', transactionsProcessed: 245, accuracyRate: 99.8 },
  { id: 2, name: 'Sarah Johnson', role: 'Treasurer', status: 'active', joinDate: '2020-06-20', email: 'sarah@example.com', phone: '555-0402', specialization: 'Reporting', transactionsProcessed: 189, accuracyRate: 99.5 },
  { id: 3, name: 'Michael Wilson', role: 'Bookkeeper', status: 'active', joinDate: '2021-03-10', email: 'michael@example.com', phone: '555-0403', specialization: 'Accounts Payable', transactionsProcessed: 156, accuracyRate: 99.2 },
  { id: 4, name: 'Lisa Davis', role: 'Financial Secretary', status: 'active', joinDate: '2022-09-05', email: 'lisa@example.com', phone: '555-0404', specialization: 'Accounts Receivable', transactionsProcessed: 98, accuracyRate: 98.9 },
  { id: 5, name: 'Robert Smith', role: 'Audit Assistant', status: 'active', joinDate: '2023-02-12', email: 'robert@example.com', phone: '555-0405', specialization: 'Compliance', transactionsProcessed: 67, accuracyRate: 100 }
];

const mockTransactions: Transaction[] = [
  { id: 1, type: 'income', category: 'Tithes', description: 'Sunday Service Collection', amount: 3500, date: '2024-01-28', approvedBy: 'David Brown', status: 'completed' },
  { id: 2, type: 'expense', category: 'Utilities', description: 'Electricity Bill - January', amount: -850, date: '2024-01-27', approvedBy: 'Sarah Johnson', status: 'completed' },
  { id: 3, type: 'income', category: 'Offerings', description: 'Special Missions Offering', amount: 1200, date: '2024-01-25', approvedBy: 'David Brown', status: 'completed' },
  { id: 4, type: 'expense', category: 'Maintenance', description: 'Building Repairs', amount: -2100, date: '2024-01-24', status: 'pending' },
  { id: 5, type: 'income', category: 'Donations', description: 'Anonymous Donation', amount: 500, date: '2024-01-23', approvedBy: 'Sarah Johnson', status: 'completed' },
  { id: 6, type: 'expense', category: 'Supplies', description: 'Office Supplies', amount: -150, date: '2024-01-22', approvedBy: 'Michael Wilson', status: 'completed' },
  { id: 7, type: 'expense', category: 'Ministry', description: 'Youth Ministry Budget', amount: -800, date: '2024-01-21', status: 'pending' },
  { id: 8, type: 'income', category: 'Events', description: 'Concert Ticket Sales', amount: 750, date: '2024-01-20', approvedBy: 'Lisa Davis', status: 'completed' }
];

const mockBudgetItems: BudgetItem[] = [
  { id: 1, category: 'Staff Salaries', budgeted: 6000, spent: 6000, remaining: 0, percentage: 100, status: 'on-track' },
  { id: 2, category: 'Building Maintenance', budgeted: 2000, spent: 2100, remaining: -100, percentage: 105, status: 'over' },
  { id: 3, category: 'Ministry Programs', budgeted: 1500, spent: 800, remaining: 700, percentage: 53, status: 'under' },
  { id: 4, category: 'Utilities', budgeted: 800, spent: 850, remaining: -50, percentage: 106, status: 'over' },
  { id: 5, category: 'Office Supplies', budgeted: 300, spent: 150, remaining: 150, percentage: 50, status: 'under' },
  { id: 6, category: 'Missions', budgeted: 1000, spent: 600, remaining: 400, percentage: 60, status: 'under' }
];

export const FinanceDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, typeFilter, statusFilter]);

  // Quick actions
  const quickActions = [
    { label: 'Add Member', icon: UserPlus, onClick: () => toast({ title: 'Add Member', description: 'Add new finance team member form would open here' }), variant: 'default' as const },
    { label: 'Record Transaction', icon: Receipt, onClick: () => toast({ title: 'Record Transaction', description: 'Transaction recording form would open here' }), variant: 'outline' as const },
    { label: 'Create Budget', icon: Calculator, onClick: () => toast({ title: 'Create Budget', description: 'Budget creation form would open here' }), variant: 'outline' as const },
    { label: 'Generate Report', icon: FileText, onClick: () => toast({ title: 'Generate Report', description: 'Financial report generation form would open here' }), variant: 'outline' as const }
  ];

  const handleBack = () => {
    navigate('/admin/departments');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'under': return 'bg-green-100 text-green-800';
      case 'on-track': return 'bg-blue-100 text-blue-800';
      case 'over': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Departments
        </Button>
      </div>

      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Department Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage church finances, budgets, transactions, and financial reporting.
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Finance Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 p-2 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Team</p>
                <p className="text-2xl font-bold text-gray-900">{mockFinanceStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-50 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Income</p>
                <p className="text-2xl font-bold text-gray-900">£{mockFinanceStats.monthlyIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-red-50 p-2 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-gray-900">£{mockFinanceStats.monthlyExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-50 p-2 rounded-full">
                <PiggyBank className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Net</p>
                <p className="text-2xl font-bold text-gray-900">£{(mockFinanceStats.monthlyIncome - mockFinanceStats.monthlyExpenses).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-50 p-2 rounded-full">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className="text-2xl font-bold text-gray-900">+{mockFinanceStats.monthlyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-50 p-2 rounded-full">
                <Calculator className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-2xl font-bold text-gray-900">{mockFinanceStats.budgetUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-50 p-2 rounded-full">
                <CreditCard className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{mockFinanceStats.pendingApprovals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="h-20 flex-col space-y-2"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Income vs Expenses Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Monthly income and expense breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Total Income</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">£{mockFinanceStats.monthlyIncome.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+{mockFinanceStats.monthlyGrowth}% from last month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Total Expenses</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">£{mockFinanceStats.monthlyExpenses.toLocaleString()}</p>
                    <p className="text-sm text-red-600">+5% from last month</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <PiggyBank className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Net Income</p>
                      <p className="text-sm text-gray-600">Income minus expenses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">£{(mockFinanceStats.monthlyIncome - mockFinanceStats.monthlyExpenses).toLocaleString()}</p>
                    <p className="text-sm text-blue-600">Monthly surplus</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
              <CardDescription>Current budget utilization by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockBudgetItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.category}</span>
                        <Badge className={getBudgetStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.status === 'over' ? 'bg-red-500' :
                            item.status === 'on-track' ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">
                        {formatCurrency(item.spent)} / {formatCurrency(item.budgeted)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.remaining >= 0 ? '+' : ''}{formatCurrency(item.remaining)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Transactions awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTransactions.filter(t => t.status === 'pending').map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <p className="text-sm text-gray-600">{transaction.category} • {transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium">Financial Transactions</h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button size="sm">
                <Receipt className="mr-2 h-4 w-4" />
                Record Transaction
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export Transactions
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{transaction.category}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {transaction.type === 'income' ?
                              <TrendingUp className="h-4 w-4 text-green-600" /> :
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            }
                            <span className={`text-sm capitalize ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                            {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.approvedBy || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Budget Management</h3>
            <Button size="sm">
              <Calculator className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Budget management coming soon</p>
                <p className="text-sm">Create and manage departmental budgets</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Finance Team</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Team management coming soon</p>
                <p className="text-sm">Manage finance team members and permissions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Financial Reports</h3>
            <Button size="sm" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Financial reporting coming soon</p>
                <p className="text-sm">Generate income statements, balance sheets, and custom reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
