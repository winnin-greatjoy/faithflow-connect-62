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
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  CreditCard,
  Banknote,
  MoreHorizontal,
} from 'lucide-react';

const recentDonations = [
  { id: 1, date: '2024-01-07', donor: 'John Smith', amount: 150, method: 'Card' },
  { id: 2, date: '2024-01-07', donor: 'Anonymous', amount: 75, method: 'Cash' },
  { id: 3, date: '2024-01-06', donor: 'Sarah Johnson', amount: 200, method: 'Bank Transfer' },
  { id: 4, date: '2024-01-06', donor: 'Mike Davis', amount: 50, method: 'Card' },
  { id: 5, date: '2024-01-05', donor: 'Emma Wilson', amount: 100, method: 'Standing Order' },
];

export const FinanceModule = () => {
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Finance Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Track donations, expenses, and financial reports.
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
            <div className="text-lg sm:text-2xl font-bold">£12,450</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +8% from last month
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
            <div className="text-lg sm:text-2xl font-bold">£3,112</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12% from last quarter
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
            <div className="text-lg sm:text-2xl font-bold">£8,750</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +3% from budget
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
            <CardTitle className="text-lg sm:text-xl">Giving Trends</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Monthly giving over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-4">
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center bg-gray-50 rounded text-center p-4">
              <p className="text-sm sm:text-base text-gray-500">Monthly giving trends chart</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
            <CardTitle className="text-lg sm:text-xl">Giving Methods</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Breakdown of donation methods
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-4">
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center bg-gray-50 rounded text-center p-4">
              <p className="text-sm sm:text-base text-gray-500">Giving methods breakdown chart</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
          <CardTitle className="text-lg sm:text-xl">Recent Donations</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Latest donations received by the church
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="hidden sm:table-header-group">
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Donor</TableHead>
                  <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                  <TableHead className="text-xs sm:text-sm">Method</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDonations.map((donation) => (
                  <TableRow key={donation.id} className="block sm:table-row border-b last:border-0">
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Date:</span>
                        <span className="text-sm sm:text-base">{donation.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Donor:</span>
                        <span className="font-medium text-sm sm:text-base">{donation.donor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Amount:</span>
                        <span className="font-medium text-sm sm:text-base">
                          £{donation.amount.toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-between items-center sm:block">
                        <span className="text-xs text-muted-foreground sm:hidden">Method:</span>
                        <Badge variant="outline" className="text-xs sm:text-sm h-5 sm:h-6">
                          {donation.method === 'Card' && <CreditCard className="mr-1 h-3 w-3" />}
                          {donation.method === 'Cash' && <Banknote className="mr-1 h-3 w-3" />}
                          {donation.method === 'Bank Transfer' && (
                            <DollarSign className="mr-1 h-3 w-3" />
                          )}
                          {donation.method === 'Standing Order' && (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          )}
                          <span className="hidden sm:inline">{donation.method}</span>
                          <span className="sm:hidden">
                            {donation.method === 'Bank Transfer'
                              ? 'Bank'
                              : donation.method === 'Standing Order'
                                ? 'Standing'
                                : donation.method}
                          </span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-4"
                        >
                          <span className="sr-only sm:not-sr-only sm:mr-2">View</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
