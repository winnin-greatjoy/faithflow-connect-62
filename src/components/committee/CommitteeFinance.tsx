
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Receipt
} from 'lucide-react';
import { mockCommitteeExpenses, mockContributions, mockPledges } from '@/data/mockCommitteeData';
import { CommitteeExpense } from '@/types/committee';

interface CommitteeFinanceProps {
  committeeId: number;
  userRole: string;
  canManage: boolean;
}

export const CommitteeFinance = ({ committeeId, userRole, canManage }: CommitteeFinanceProps) => {
  const [expenses] = useState<CommitteeExpense[]>(mockCommitteeExpenses);
  
  // Calculate financial summary
  const totalIncome = mockContributions.reduce((sum, contrib) => sum + contrib.amount, 0);
  const totalExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const getStatusIcon = (status: CommitteeExpense['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'paid':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: CommitteeExpense['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Committee Finance</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-xl font-bold text-green-600">£{totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">£{totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Expenses</p>
                <p className="text-xl font-bold text-yellow-600">£{pendingExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className={`h-4 w-4 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="text-sm text-gray-600">Net Balance</p>
                <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{netBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Tabs */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="pledges">Pledges</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Expense Requests</h3>
            {canManage && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Expense Request
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{expense.description}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">£{expense.amount.toFixed(2)}</span>
                          <Badge className={getStatusColor(expense.status)}>
                            {getStatusIcon(expense.status)}
                            <span className="ml-1">{expense.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Category:</span>
                          <p>{expense.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Requested by:</span>
                          <p>{expense.requestedBy}</p>
                        </div>
                        <div>
                          <span className="font-medium">Requested:</span>
                          <p>{new Date(expense.requestedAt).toLocaleDateString()}</p>
                        </div>
                        {expense.approvedBy && (
                          <div>
                            <span className="font-medium">Approved by:</span>
                            <p>{expense.approvedBy}</p>
                          </div>
                        )}
                      </div>
                      
                      {expense.notes && (
                        <p className="text-sm text-gray-600 mt-2">{expense.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      {expense.receiptUrl && (
                        <Button variant="outline" size="sm">
                          <Receipt className="mr-1 h-3 w-3" />
                          View Receipt
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    
                    {canManage && expense.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Income Tracking</h3>
            <p className="mt-1 text-sm text-gray-500">
              Track contributions, donations, and other income sources
            </p>
          </div>
        </TabsContent>

        <TabsContent value="pledges" className="space-y-4">
          <div className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Pledge Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage pledge campaigns and track payments
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <Download className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Financial Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate and download financial reports
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
