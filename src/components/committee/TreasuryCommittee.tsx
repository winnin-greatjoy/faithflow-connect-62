
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Receipt,
  Download,
  Upload,
  Wallet,
  Building2
} from 'lucide-react';
import { 
  mockCashAccounts, 
  mockReceipts, 
  mockDisbursements 
} from '@/data/mockCommitteeData';

interface TreasuryCommitteeProps {
  userRole: string;
  canManage: boolean;
}

export const TreasuryCommittee = ({ userRole, canManage }: TreasuryCommitteeProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate KPIs
  const totalBalance = mockCashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const todayReceipts = mockReceipts.length; // Mock: all receipts are from today
  const todayDisbursements = mockDisbursements.length;
  const receiptTotal = mockReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const disbursementTotal = mockDisbursements.reduce((sum, disbursement) => sum + disbursement.amount, 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'mobile_wallet': return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'petty_cash': return <Banknote className="h-4 w-4 text-yellow-600" />;
      case 'cash_box': return <Wallet className="h-4 w-4 text-purple-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-3 w-3" />;
      case 'bank_transfer': return <Building2 className="h-3 w-3" />;
      case 'mobile_money': return <Smartphone className="h-3 w-3" />;
      case 'card': return <CreditCard className="h-3 w-3" />;
      default: return <DollarSign className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Treasury Committee</h2>
          <p className="text-gray-600">Cash management and disbursement</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          )}
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-xl font-bold text-green-600">£{totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Today's Receipts</p>
                <p className="text-xl font-bold text-blue-600">{todayReceipts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Receipt Value</p>
                <p className="text-xl font-bold text-purple-600">£{receiptTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Disbursements</p>
                <p className="text-xl font-bold text-orange-600">{todayDisbursements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Disbursed Value</p>
                <p className="text-xl font-bold text-red-600">£{disbursementTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treasury Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cash Position */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Position</CardTitle>
                <CardDescription>Current balances across all accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCashAccounts.map((account) => (
                  <div key={account.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getAccountIcon(account.type)}
                        <div>
                          <h4 className="font-medium">{account.name}</h4>
                          {account.accountNumber && (
                            <p className="text-sm text-gray-600">{account.accountNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">£{account.balance.toFixed(2)}</p>
                        {account.lastReconciled && (
                          <p className="text-xs text-gray-500">
                            Last reconciled: {new Date(account.lastReconciled).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Receipt className="mr-1 h-3 w-3" />
                        Transactions
                      </Button>
                      {canManage && (
                        <Button variant="outline" size="sm">
                          Reconcile
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest receipts and disbursements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Receipts</h4>
                  {mockReceipts.slice(0, 3).map((receipt) => (
                    <div key={receipt.id} className="flex justify-between items-center border-b pb-2 mb-2">
                      <div>
                        <p className="font-medium text-green-600">+£{receipt.amount}</p>
                        <p className="text-sm text-gray-600">{receipt.purpose}</p>
                        <p className="text-xs text-gray-500">{receipt.payerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {getPaymentMethodIcon(receipt.method)}
                          <Badge variant="outline">{receipt.method.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(receipt.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Disbursements</h4>
                  {mockDisbursements.slice(0, 2).map((disbursement) => (
                    <div key={disbursement.id} className="flex justify-between items-center border-b pb-2 mb-2">
                      <div>
                        <p className="font-medium text-red-600">-£{disbursement.amount}</p>
                        <p className="text-sm text-gray-600">{disbursement.purpose}</p>
                        <p className="text-xs text-gray-500">{disbursement.beneficiaryName}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {getPaymentMethodIcon(disbursement.method)}
                          <Badge variant="outline">{disbursement.method.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(disbursement.disbursedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Cash Accounts</h3>
            {canManage && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {mockCashAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      {getAccountIcon(account.type)}
                      <div>
                        <h4 className="text-lg font-medium">{account.name}</h4>
                        <p className="text-gray-600 capitalize">{account.type.replace('_', ' ')}</p>
                        {account.accountNumber && (
                          <p className="text-sm text-gray-500">{account.accountNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">£{account.balance.toFixed(2)}</p>
                      {account.lastReconciled && (
                        <p className="text-sm text-gray-500 mt-1">
                          Last reconciled: {new Date(account.lastReconciled).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Receipt className="mr-1 h-3 w-3" />
                      View Transactions
                    </Button>
                    {canManage && (
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">Reconcile</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Receipt Management</h3>
            {canManage && (
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Batch Import
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Issue Receipt
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {mockReceipts.map((receipt) => (
              <Card key={receipt.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Receipt className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Receipt #{receipt.receiptNo}</h4>
                        <p className="text-sm text-gray-600">{receipt.purpose}</p>
                        <p className="text-xs text-gray-500">
                          Issued by {receipt.issuedBy} • {new Date(receipt.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">£{receipt.amount}</p>
                      <p className="text-sm text-gray-600">{receipt.payerName}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {getPaymentMethodIcon(receipt.method)}
                        <Badge variant="outline" className="text-xs">
                          {receipt.method.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Download className="mr-1 h-3 w-3" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm">View Details</Button>
                    {canManage && (
                      <Button variant="outline" size="sm">Edit</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disbursements" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Disbursement Management</h3>
            {canManage && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Disbursement
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {mockDisbursements.map((disbursement) => (
              <Card key={disbursement.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Download className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{disbursement.beneficiaryName}</h4>
                        <p className="text-sm text-gray-600">{disbursement.purpose}</p>
                        <p className="text-xs text-gray-500">
                          Disbursed by {disbursement.disbursedBy} • {new Date(disbursement.disbursedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Approved by {disbursement.approvedBy}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">£{disbursement.amount}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {getPaymentMethodIcon(disbursement.method)}
                        <Badge variant="outline" className="text-xs">
                          {disbursement.method.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {disbursement.notes && (
                    <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded">
                      {disbursement.notes}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-2">
                      {disbursement.receiptUrl && (
                        <Button variant="outline" size="sm">
                          <Receipt className="mr-1 h-3 w-3" />
                          View Receipt
                        </Button>
                      )}
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                    
                    {canManage && (
                      <Button variant="outline" size="sm">Edit</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-4">
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Bank Deposits</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage banking schedules and deposit slips
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Treasury Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Cashbook records and deposit logs
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
