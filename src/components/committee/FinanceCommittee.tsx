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
  Receipt,
  FileText,
  Settings as SettingsIcon,
  Calendar
} from 'lucide-react';
import { mockBudgetEnvelopes, mockIncomeTransactions, mockExpenseRequests } from '@/data/mockCommitteeData';

interface FinanceCommitteeProps {
  userRole: string;
  canManage: boolean;
}

export const FinanceCommittee = ({ userRole, canManage }: FinanceCommitteeProps) => {
  const [budgetEnvelopes] = useState(mockBudgetEnvelopes);
  const [incomeTransactions] = useState(mockIncomeTransactions);
  const [expenseRequests] = useState(mockExpenseRequests);

  // Calculate financial summary
  const totalBudget = budgetEnvelopes.reduce((sum, env) => sum + env.allocatedAmount, 0);
  const totalSpent = budgetEnvelopes.reduce((sum, env) => sum + env.spentAmount, 0);
  const totalIncome = incomeTransactions.reduce((sum, trans) => sum + trans.amount, 0);
  const pendingExpenses = expenseRequests.filter(req => req.status === 'submitted').reduce((sum, req) => sum + req.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Finance Committee</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Budget Item
            </Button>
          )}
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
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
                <p className="text-xl font-bold text-yellow-600">£{pendingExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Tabs */}
      <Tabs defaultValue="budgets" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="budgets">Budget Envelopes</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expense Requests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Budget Envelopes</h3>
            {canManage && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Envelope
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {budgetEnvelopes.map((envelope) => (
              <Card key={envelope.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{envelope.name}</h4>
                      <p className="text-sm text-gray-600">{envelope.category} • FY {envelope.fiscalYear}</p>
                    </div>
                    <Badge 
                      variant={envelope.status === 'over_budget' ? 'destructive' : 'secondary'}
                    >
                      {envelope.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Allocated</p>
                      <p className="font-bold text-blue-600">£{envelope.allocatedAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Spent</p>
                      <p className="font-bold text-red-600">£{envelope.spentAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining</p>
                      <p className={`font-bold ${envelope.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        £{envelope.remainingAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          envelope.spentAmount > envelope.allocatedAmount 
                            ? 'bg-red-500' 
                            : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: `${Math.min((envelope.spentAmount / envelope.allocatedAmount) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((envelope.spentAmount / envelope.allocatedAmount) * 100)}% utilized
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm">
                        Edit Envelope
                      </Button>
                      <Button variant="outline" size="sm">
                        View Transactions
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Income Transactions</h3>
            {canManage && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Income
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {incomeTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{transaction.description}</h4>
                        <span className="text-lg font-bold text-green-600">
                          £{transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Receipt No:</span>
                          <p>{transaction.receiptNo}</p>
                        </div>
                        <div>
                          <span className="font-medium">Source:</span>
                          <p className="capitalize">{transaction.source.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Method:</span>
                          <p className="capitalize">{transaction.method.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Recorded by:</span>
                          <p>{transaction.recordedBy}</p>
                        </div>
                      </div>
                      
                      {transaction.memberName && (
                        <p className="text-sm text-gray-600 mt-2">
                          From: {transaction.memberName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-500">
                      Recorded: {new Date(transaction.recordedAt).toLocaleString()}
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Receipt className="mr-1 h-3 w-3" />
                        View Receipt
                      </Button>
                      {canManage && (
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {expenseRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{request.description}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">£{request.amount.toFixed(2)}</span>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Envelope:</span>
                          <p>{request.envelopeName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Requested by:</span>
                          <p>{request.requesterName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span>
                          <p>{request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        {request.vendor && (
                          <div>
                            <span className="font-medium">Vendor:</span>
                            <p>{request.vendor}</p>
                          </div>
                        )}
                      </div>
                      
                      {request.notes && (
                        <p className="text-sm text-gray-600 mt-2">{request.notes}</p>
                      )}

                      {/* Approval History */}
                      {request.approvals.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">Approval History</h5>
                          <div className="space-y-1">
                            {request.approvals.map((approval) => (
                              <div key={approval.id} className="text-xs text-gray-600 flex items-center space-x-2">
                                {getStatusIcon(approval.status)}
                                <span>
                                  {approval.approverName} ({approval.approverRole}) - {approval.status}
                                  {approval.timestamp && ` on ${new Date(approval.timestamp).toLocaleDateString()}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      {request.quoteUrl && (
                        <Button variant="outline" size="sm">
                          <FileText className="mr-1 h-3 w-3" />
                          View Quote
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    
                    {canManage && request.status === 'submitted' && (
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

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Financial Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate budget vs actual, P&L, and audit reports
            </p>
            {canManage && (
              <div className="mt-6 space-x-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Budget Report
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Income Statement
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Expense Report
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="text-center py-8">
            <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Finance Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure fiscal year, approval thresholds, and account settings
            </p>
            {canManage && (
              <div className="mt-6">
                <Button>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Configure Settings
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
