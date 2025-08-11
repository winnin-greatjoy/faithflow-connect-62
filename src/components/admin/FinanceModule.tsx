
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, Download, CreditCard, Banknote } from 'lucide-react';

const recentDonations = [
  { id: 1, date: '2024-01-07', donor: 'John Smith', amount: 150, method: 'Card' },
  { id: 2, date: '2024-01-07', donor: 'Anonymous', amount: 75, method: 'Cash' },
  { id: 3, date: '2024-01-06', donor: 'Sarah Johnson', amount: 200, method: 'Bank Transfer' },
  { id: 4, date: '2024-01-06', donor: 'Mike Davis', amount: 50, method: 'Card' },
  { id: 5, date: '2024-01-05', donor: 'Emma Wilson', amount: 100, method: 'Standing Order' },
];

export const FinanceModule = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-gray-600 mt-2">Track donations, expenses, and financial reports.</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Financial Report
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Giving This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£12,450</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Weekly Giving</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£3,112</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12% from last quarter
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£8,750</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +3% from budget
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Giving Trends</CardTitle>
            <CardDescription>Monthly giving over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Chart placeholder - Monthly giving trends</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giving Methods</CardTitle>
            <CardDescription>Breakdown of donation methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Chart placeholder - Pie chart of giving methods</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest donations received by the church</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.date}</TableCell>
                  <TableCell>{donation.donor}</TableCell>
                  <TableCell className="font-medium">£{donation.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center w-fit">
                      {donation.method === 'Card' && <CreditCard className="mr-1 h-3 w-3" />}
                      {donation.method === 'Cash' && <Banknote className="mr-1 h-3 w-3" />}
                      {donation.method === 'Bank Transfer' && <DollarSign className="mr-1 h-3 w-3" />}
                      {donation.method === 'Standing Order' && <TrendingUp className="mr-1 h-3 w-3" />}
                      {donation.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
