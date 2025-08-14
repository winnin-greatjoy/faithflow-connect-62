
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
  AlertTriangle,
  Download,
  FileText,
  PieChart,
  Target
} from 'lucide-react';
import { 
  mockBudgetEnvelopes, 
  mockIncomeTransactions, 
  mockExpenseRequests 
} from '@/data/mockCommitteeData';

interface FinanceCommitteeProps {
  userRole: string;
  canManage: boolean;
}

export const FinanceCommittee = ({ userRole, canManage }: FinanceCommitteeProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate KPIs
  const totalBudget = mockBudgetEnvelopes.reduce((sum, env) => sum + env.allocatedAmount, 0);
  const totalSpent = mockBudgetEnvelopes.reduce((sum, env) => sum + env.spentAmount, 0);
  const totalIncome = mockIncomeTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const pendingRequests = mockExpenseRequests.filter(req => req.status === 'submitted').length;
  const cashOnHand = totalIncome - totalSpent;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'submitted': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'paid': return <DollarSign className="h-4 w-4 text-blue-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'over_budget': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Finance Committee</h2>
          <p className="text-gray-600">Financial planning, budgets, and reporting</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Budget Item
            </Button>
          )}
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-xl font-bold text-blue-600">£{totalBudget.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-xl font-bold text-red-600">£{totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className={`h-4 w-4 ${cashOnHand >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="text-sm text-gray-600">Cash on Hand</p>
                <p className={`text-xl font-bold ${cashOnHand >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{cashOnHand.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Budget Envelopes */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Envelopes</CardTitle>
                <CardDescription>Current budget allocation and spending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockBudgetEnvelopes.map((envelope) => (
                  <div key={envelope.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{envelope.name}</h4>
                        <p className="text-sm text-gray-600">{envelope.category}</p>
                      </div>
                      <Badge className={getStatusColor(envelope.status)}>
                        {envelope.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Allocated:</span>
                        <span className="font-medium">£{envelope.allocatedAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Spent:</span>
                        <span className="font-medium">£{envelope.spentAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remaining:</span>
                        <span className={`font-medium ${envelope.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          £{envelope.remainingAmount}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${envelope.status === 'over_budget' ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ 
                            width: `${Math.min((envelope.spentAmount / envelope.allocatedAmount) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest income and expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockIncomeTransactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium text-green-600">+£{transaction.amount}</p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.memberName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{transaction.source}</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.recordedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {mockExpenseRequests.filter(req => req.status === 'approved').slice(0, 2).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium text-red-600">-£{expense.amount}</p>
                      <p className="text-sm text-gray-600">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.requesterName}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(expense.status)}>
                        {getStatusIcon(expense.status)}
                        <span className="ml-1">{expense.status}</span>
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {expense.submittedAt && new Date(expense.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Budget Envelopes</h3>
            {canManage && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Envelope
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {mockBudgetEnvelopes.map((envelope) => (
              <Card key={envelope.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium">{envelope.name}</h4>
                      <p className="text-gray-600">{envelope.category} • FY {envelope.fiscalYear}</p>
                    </div>
                    <Badge className={getStatusColor(envelope.status)}>
                      {envelope.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">£{envelope.allocatedAmount}</p>
                      <p className="text-sm text-gray-600">Allocated</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">£{envelope.spentAmount}</p>
                      <p className="text-sm text-gray-600">Spent</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${envelope.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        £{envelope.remainingAmount}
                      </p>
                      <p className="text-sm text-gray-600">Remaining</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full ${envelope.status === 'over_budget' ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ 
                        width: `${Math.min((envelope.spentAmount / envelope.allocatedAmount) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                    {canManage && (
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">
                          <PieChart className="mr-1 h-3 w-3" />
                          Analysis
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Income Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Track dues, pledges, offerings, and donations
            </p>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Expense Requests</h3>
            {canManage && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockExpenseRequests.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Envelope:</span>
                          <p>{expense.envelopeName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Requested by:</span>
                          <p>{expense.requesterName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>
                          <p>{expense.submittedAt && new Date(expense.submittedAt).toLocaleDateString()}</p>
                        </div>
                        {expense.vendor && (
                          <div>
                            <span className="font-medium">Vendor:</span>
                            <p>{expense.vendor}</p>
                          </div>
                        )}
                      </div>
                      
                      {expense.notes && (
                        <p className="text-sm text-gray-600 mb-3">{expense.notes}</p>
                      )}

                      {/* Approval Chain */}
                      {expense.approvals.length > 0 && (
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium mb-2">Approval Status:</p>
                          <div className="space-y-2">
                            {expense.approvals.map((approval) => (
                              <div key={approval.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(approval.status)}
                                  <span>{approval.approverName} ({approval.approverRole})</span>
                                </div>
                                <div className="text-right">
                                  <Badge className={getStatusColor(approval.status)}>
                                    {approval.status}
                                  </Badge>
                                  {approval.timestamp && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(approval.timestamp).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {expense.quoteUrl && (
                        <Button variant="outline" size="sm">
                          <FileText className="mr-1 h-3 w-3" />
                          View Quote
                        </Button>
                      )}
                      {expense.receiptUrl && (
                        <Button variant="outline" size="sm">
                          <FileText className="mr-1 h-3 w-3" />
                          View Receipt
                        </Button>
                      )}
                    </div>
                    
                    {canManage && expense.status === 'submitted' && (
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

        <TabsContent value="reconciliation" className="space-y-4">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Bank Reconciliation</h3>
            <p className="mt-1 text-sm text-gray-500">
              Import statements and reconcile accounts
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <PieChart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Financial Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              P&L statements, budget vs actual, and audit trails
            </p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="text-center py-8">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Finance Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage accounts, categories, and approval thresholds
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
