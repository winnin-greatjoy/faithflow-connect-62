import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { format, parseISO, startOfMonth, subMonths, subDays } from 'date-fns';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Branch = {
  id: string;
  name: string;
  is_district_hq?: boolean;
};

type AttendanceRow = { branch_id: string; attendance_date: string };
type MemberRow = { branch_id: string; date_joined: string };
type FinanceRow = {
  branch_id: string;
  transaction_date: string;
  amount: number;
  type: string;
  category: string;
};
type EventRow = { branch_id: string; event_date: string; title: string };

type HealthRow = {
  branch: string;
  attendance_30d: number;
  new_members_30d: number;
  events_30d: number;
  finance_30d: number;
  score: number;
};

function toMonthKey(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'yyyy-MM');
  } catch {
    return dateStr.slice(0, 7);
  }
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportCsv(filename: string, rows: any[]) {
  const csv = Papa.unparse(rows ?? []);
  downloadBlob(filename, new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
}

function exportExcel(filename: string, sheetName: string, rows: any[]) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows ?? []);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

async function exportPdf(filename: string, element: HTMLElement) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const y = Math.max(0, (pageHeight - imgHeight) / 2);
  pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
  pdf.save(filename);
}

export const DistrictReports: React.FC<{ branches: Branch[] }> = ({ branches }) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState<
    'attendance' | 'membership' | 'finance' | 'events' | 'health'
  >('attendance');

  const reportRef = React.useRef<HTMLDivElement | null>(null);

  const [attendanceChart, setAttendanceChart] = React.useState<any[]>([]);
  const [attendanceByBranchRows, setAttendanceByBranchRows] = React.useState<any[]>([]);

  const [membershipChart, setMembershipChart] = React.useState<any[]>([]);
  const [membershipByBranchRows, setMembershipByBranchRows] = React.useState<any[]>([]);

  const [financeChart, setFinanceChart] = React.useState<any[]>([]);
  const [financeSummaryRows, setFinanceSummaryRows] = React.useState<any[]>([]);

  const [eventsChart, setEventsChart] = React.useState<any[]>([]);
  const [recentEventsRows, setRecentEventsRows] = React.useState<any[]>([]);

  const [healthRows, setHealthRows] = React.useState<HealthRow[]>([]);

  const branchIds = React.useMemo(() => branches.map((b) => b.id), [branches]);
  const branchNameById = React.useMemo(() => {
    const m = new Map<string, string>();
    branches.forEach((b) => m.set(b.id, b.name));
    return m;
  }, [branches]);

  React.useEffect(() => {
    const run = async () => {
      if (!branchIds.length) {
        setAttendanceChart([]);
        setAttendanceByBranchRows([]);
        setMembershipChart([]);
        setMembershipByBranchRows([]);
        setFinanceChart([]);
        setFinanceSummaryRows([]);
        setEventsChart([]);
        setRecentEventsRows([]);
        setHealthRows([]);
        return;
      }

      setLoading(true);
      try {
        const now = new Date();
        const start6m = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd');
        const start12m = format(startOfMonth(subMonths(now, 11)), 'yyyy-MM-dd');
        const start30d = format(subDays(now, 30), 'yyyy-MM-dd');

        const [attRes, memRes, finRes, evtRes] = await Promise.all([
          supabase
            .from('attendance')
            .select('attendance_date, branch_id')
            .in('branch_id', branchIds)
            .gte('attendance_date', start6m),
          supabase
            .from('members')
            .select('date_joined, branch_id')
            .in('branch_id', branchIds)
            .gte('date_joined', start12m),
          supabase
            .from('finance_records')
            .select('transaction_date, branch_id, amount, type, category')
            .in('branch_id', branchIds)
            .gte('transaction_date', start12m),
          supabase
            .from('events')
            .select('event_date, branch_id, title')
            .in('branch_id', branchIds)
            .gte('event_date', start12m)
            .order('event_date', { ascending: false }),
        ]);

        if (attRes.error) throw attRes.error;
        if (memRes.error) throw memRes.error;
        if (finRes.error) throw finRes.error;
        if (evtRes.error) throw evtRes.error;

        const attendance = (attRes.data || []) as AttendanceRow[];
        const members = (memRes.data || []) as MemberRow[];
        const finance = (finRes.data || []) as FinanceRow[];
        const events = (evtRes.data || []) as EventRow[];

        // Attendance trends (last 6 months)
        const attTotalsByBranch: Record<string, number> = {};
        const attByMonthByBranch: Record<string, Record<string, number>> = {};
        attendance.forEach((r) => {
          const m = toMonthKey(r.attendance_date);
          attByMonthByBranch[m] = attByMonthByBranch[m] || {};
          attByMonthByBranch[m][r.branch_id] = (attByMonthByBranch[m][r.branch_id] || 0) + 1;
          attTotalsByBranch[r.branch_id] = (attTotalsByBranch[r.branch_id] || 0) + 1;
        });
        const topAttendanceBranches = Object.entries(attTotalsByBranch)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => id);

        const months6 = Array.from({ length: 6 }).map((_, idx) =>
          format(startOfMonth(subMonths(now, 5 - idx)), 'yyyy-MM')
        );

        const attChartRows = months6.map((m) => {
          const row: any = { month: m };
          let total = 0;
          topAttendanceBranches.forEach((bid) => {
            const label = branchNameById.get(bid) || bid;
            const v = attByMonthByBranch[m]?.[bid] || 0;
            row[label] = v;
            total += v;
          });
          row.Total = total;
          return row;
        });
        setAttendanceChart(attChartRows);

        const attByBranchRows = Object.entries(attTotalsByBranch)
          .map(([bid, total]) => ({
            branch: branchNameById.get(bid) || bid,
            attendance: total,
          }))
          .sort((a, b) => b.attendance - a.attendance);
        setAttendanceByBranchRows(attByBranchRows);

        // Membership growth (last 12 months)
        const memTotalsByBranch: Record<string, number> = {};
        const memByMonthByBranch: Record<string, Record<string, number>> = {};
        members.forEach((r) => {
          const m = toMonthKey(r.date_joined);
          memByMonthByBranch[m] = memByMonthByBranch[m] || {};
          memByMonthByBranch[m][r.branch_id] = (memByMonthByBranch[m][r.branch_id] || 0) + 1;
          memTotalsByBranch[r.branch_id] = (memTotalsByBranch[r.branch_id] || 0) + 1;
        });

        const topMemberBranches = Object.entries(memTotalsByBranch)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => id);

        const months12 = Array.from({ length: 12 }).map((_, idx) =>
          format(startOfMonth(subMonths(now, 11 - idx)), 'yyyy-MM')
        );

        const memChartRows = months12.map((m) => {
          const row: any = { month: m };
          let total = 0;
          topMemberBranches.forEach((bid) => {
            const label = branchNameById.get(bid) || bid;
            const v = memByMonthByBranch[m]?.[bid] || 0;
            row[label] = v;
            total += v;
          });
          row.Total = total;
          return row;
        });
        setMembershipChart(memChartRows);

        const memByBranchRows = Object.entries(memTotalsByBranch)
          .map(([bid, total]) => ({
            branch: branchNameById.get(bid) || bid,
            new_members: total,
          }))
          .sort((a, b) => b.new_members - a.new_members);
        setMembershipByBranchRows(memByBranchRows);

        // Financial summaries (read-only)
        const finByMonth: Record<string, { income: number; expense: number }> = {};
        const finByBranch: Record<string, { income: number; expense: number }> = {};
        finance.forEach((r) => {
          const m = toMonthKey(r.transaction_date);
          const t = String(r.type || '').toLowerCase();
          const isExpense = t.includes('expense') || t.includes('out');
          const bucket = isExpense ? 'expense' : 'income';
          finByMonth[m] = finByMonth[m] || { income: 0, expense: 0 };
          finByMonth[m][bucket] += Number(r.amount || 0);
          finByBranch[r.branch_id] = finByBranch[r.branch_id] || { income: 0, expense: 0 };
          finByBranch[r.branch_id][bucket] += Number(r.amount || 0);
        });

        const finChartRows = months12.map((m) => ({
          month: m,
          income: Number((finByMonth[m]?.income || 0).toFixed(2)),
          expense: Number((finByMonth[m]?.expense || 0).toFixed(2)),
        }));
        setFinanceChart(finChartRows);

        const finSummary = Object.entries(finByBranch)
          .map(([bid, v]) => ({
            branch: branchNameById.get(bid) || bid,
            income: Number(v.income.toFixed(2)),
            expense: Number(v.expense.toFixed(2)),
            net: Number((v.income - v.expense).toFixed(2)),
          }))
          .sort((a, b) => b.net - a.net);
        setFinanceSummaryRows(finSummary);

        // Events activity
        const evtByMonth: Record<string, number> = {};
        const evtByBranch: Record<string, number> = {};
        events.forEach((r) => {
          const m = toMonthKey(r.event_date);
          evtByMonth[m] = (evtByMonth[m] || 0) + 1;
          evtByBranch[r.branch_id] = (evtByBranch[r.branch_id] || 0) + 1;
        });

        const evtChartRows = months12.map((m) => ({
          month: m,
          events: evtByMonth[m] || 0,
        }));
        setEventsChart(evtChartRows);

        const recentEvents = (events || []).slice(0, 50).map((e) => ({
          date: e.event_date,
          branch: branchNameById.get(e.branch_id) || e.branch_id,
          title: e.title,
        }));
        setRecentEventsRows(recentEvents);

        // Branch health score (last 30 days)
        const att30ByBranch: Record<string, number> = {};
        attendance
          .filter((r) => r.attendance_date >= start30d)
          .forEach((r) => {
            att30ByBranch[r.branch_id] = (att30ByBranch[r.branch_id] || 0) + 1;
          });
        const mem30ByBranch: Record<string, number> = {};
        members
          .filter((r) => r.date_joined >= start30d)
          .forEach((r) => {
            mem30ByBranch[r.branch_id] = (mem30ByBranch[r.branch_id] || 0) + 1;
          });
        const evt30ByBranch: Record<string, number> = {};
        events
          .filter((r) => r.event_date >= start30d)
          .forEach((r) => {
            evt30ByBranch[r.branch_id] = (evt30ByBranch[r.branch_id] || 0) + 1;
          });
        const fin30ByBranch: Record<string, number> = {};
        finance
          .filter((r) => r.transaction_date >= start30d)
          .forEach((r) => {
            fin30ByBranch[r.branch_id] = (fin30ByBranch[r.branch_id] || 0) + Number(r.amount || 0);
          });

        const maxAtt = Math.max(1, ...Object.values(att30ByBranch));
        const maxMem = Math.max(1, ...Object.values(mem30ByBranch));
        const maxEvt = Math.max(1, ...Object.values(evt30ByBranch));
        const maxFin = Math.max(1, ...Object.values(fin30ByBranch));

        const health: HealthRow[] = branches
          .map((b) => {
            const a = att30ByBranch[b.id] || 0;
            const m = mem30ByBranch[b.id] || 0;
            const e = evt30ByBranch[b.id] || 0;
            const f = fin30ByBranch[b.id] || 0;
            const score = Math.round(
              100 *
                (0.4 * (a / maxAtt) + 0.2 * (m / maxMem) + 0.2 * (e / maxEvt) + 0.2 * (f / maxFin))
            );
            return {
              branch: b.name,
              attendance_30d: a,
              new_members_30d: m,
              events_30d: e,
              finance_30d: Number(f.toFixed(2)),
              score,
            };
          })
          .sort((a, b) => b.score - a.score);
        setHealthRows(health);
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e?.message || 'Failed to load district reports',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [branchIds, branchNameById, branches, toast]);

  const handleExportCurrent = async (formatType: 'csv' | 'xlsx' | 'pdf') => {
    try {
      if (formatType === 'pdf') {
        if (!reportRef.current) return;
        await exportPdf(`district-reports-${tab}.pdf`, reportRef.current);
        return;
      }

      if (tab === 'attendance') {
        if (formatType === 'csv') {
          exportCsv('attendance-by-branch.csv', attendanceByBranchRows);
        } else {
          exportExcel('attendance-by-branch.xlsx', 'Attendance', attendanceByBranchRows);
        }
      }
      if (tab === 'membership') {
        if (formatType === 'csv') {
          exportCsv('membership-growth-by-branch.csv', membershipByBranchRows);
        } else {
          exportExcel('membership-growth-by-branch.xlsx', 'Membership', membershipByBranchRows);
        }
      }
      if (tab === 'finance') {
        if (formatType === 'csv') {
          exportCsv('financial-summary-by-branch.csv', financeSummaryRows);
        } else {
          exportExcel('financial-summary-by-branch.xlsx', 'Finance', financeSummaryRows);
        }
      }
      if (tab === 'events') {
        if (formatType === 'csv') {
          exportCsv('events-activity.csv', recentEventsRows);
        } else {
          exportExcel('events-activity.xlsx', 'Events', recentEventsRows);
        }
      }
      if (tab === 'health') {
        if (formatType === 'csv') {
          exportCsv('branch-health-score.csv', healthRows);
        } else {
          exportExcel('branch-health-score.xlsx', 'Health', healthRows);
        }
      }
    } catch (e: any) {
      toast({
        title: 'Export failed',
        description: e?.message || 'Could not export report',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6" ref={reportRef}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">District Reports</div>
          <div className="text-sm text-muted-foreground">
            Attendance, membership, finance, events and branch health (district-wide).
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExportCurrent('csv')} disabled={loading}>
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExportCurrent('xlsx')} disabled={loading}>
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExportCurrent('pdf')} disabled={loading}>
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance trends (Top branches, last 6 months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(attendanceChart?.[0] || {})
                        .filter((k) => k !== 'month' && k !== 'Total')
                        .map((k) => (
                          <Bar key={k} dataKey={k} stackId="a" fill="#6366f1" />
                        ))}
                      <Line type="monotone" dataKey="Total" stroke="#111827" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance by branch</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceByBranchRows.map((r, idx) => (
                      <TableRow key={`${r.branch}-${idx}`}>
                        <TableCell>{r.branch}</TableCell>
                        <TableCell className="text-right">{r.attendance}</TableCell>
                      </TableRow>
                    ))}
                    {attendanceByBranchRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                          No attendance records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="membership" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Membership growth (Top branches, last 12 months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={membershipChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(membershipChart?.[0] || {})
                        .filter((k) => k !== 'month' && k !== 'Total')
                        .map((k) => (
                          <Line key={k} type="monotone" dataKey={k} stroke="#6366f1" />
                        ))}
                      <Line type="monotone" dataKey="Total" stroke="#111827" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New members by branch</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">New Members</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membershipByBranchRows.map((r, idx) => (
                      <TableRow key={`${r.branch}-${idx}`}>
                        <TableCell>{r.branch}</TableCell>
                        <TableCell className="text-right">{r.new_members}</TableCell>
                      </TableRow>
                    ))}
                    {membershipByBranchRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                          No membership records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial summaries (read-only)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financeChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#16a34a" />
                      <Line type="monotone" dataKey="expense" stroke="#dc2626" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Finance by branch</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Income</TableHead>
                      <TableHead className="text-right">Expense</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financeSummaryRows.map((r, idx) => (
                      <TableRow key={`${r.branch}-${idx}`}>
                        <TableCell>{r.branch}</TableCell>
                        <TableCell className="text-right">{r.income}</TableCell>
                        <TableCell className="text-right">{r.expense}</TableCell>
                        <TableCell className="text-right">{r.net}</TableCell>
                      </TableRow>
                    ))}
                    {financeSummaryRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No finance records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Events activity (last 12 months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventsChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="events" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent events</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEventsRows.map((r, idx) => (
                      <TableRow key={`${r.title}-${idx}`}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.branch}</TableCell>
                        <TableCell>{r.title}</TableCell>
                      </TableRow>
                    ))}
                    {recentEventsRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No events found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branch health score (last 30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Attendance (30d)</TableHead>
                    <TableHead className="text-right">New Members (30d)</TableHead>
                    <TableHead className="text-right">Events (30d)</TableHead>
                    <TableHead className="text-right">Finance (30d)</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthRows.map((r) => (
                    <TableRow key={r.branch}>
                      <TableCell>{r.branch}</TableCell>
                      <TableCell className="text-right">{r.attendance_30d}</TableCell>
                      <TableCell className="text-right">{r.new_members_30d}</TableCell>
                      <TableCell className="text-right">{r.events_30d}</TableCell>
                      <TableCell className="text-right">{r.finance_30d}</TableCell>
                      <TableCell className="text-right">{r.score}</TableCell>
                    </TableRow>
                  ))}
                  {healthRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
