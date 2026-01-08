import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { ExportManager } from '@/modules/events/components/dashboard/analytics/ExportManager';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, DollarSign, Users } from 'lucide-react';

const ATTENDANCE_DATA = [
  { time: '09:00', start: 0, checkins: 45 },
  { time: '09:15', start: 45, checkins: 120 },
  { time: '09:30', start: 165, checkins: 380 },
  { time: '09:45', start: 545, checkins: 590 },
  { time: '10:00', start: 1135, checkins: 210 },
  { time: '10:15', start: 1345, checkins: 85 },
  { time: '10:30', start: 1430, checkins: 45 },
];

const FINANCIAL_DATA = [
  { name: 'Offering', budget: 15000, actual: 18250 },
  { name: 'Pledges', budget: 50000, actual: 32400 },
  { name: 'Merch', budget: 2000, actual: 2800 },
];

const FUNNEL_DATA = [
  { name: 'Total Registrations', value: 1850, color: '#3b82f6' },
  { name: 'Checked In', value: 1475, color: '#10b981' },
  { name: 'First Timers', value: 142, color: '#f59e0b' },
  { name: 'New Converts', value: 38, color: '#ec4899' },
];

export const GlobalAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black">Performance Analytics</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
            Real-time operational insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            Last 24 Hours
          </Button>
          <ExportManager
            moduleName="Global Analytics"
            data={[...ATTENDANCE_DATA, ...FINANCIAL_DATA, ...FUNNEL_DATA]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Velocity Chart */}
        <Card className="col-span-2 p-6 rounded-[32px] border-none shadow-xl shadow-primary/5 bg-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Check-in Velocity</h3>
                <p className="text-xs text-muted-foreground">Arrival rate per 15 mins</p>
              </div>
            </div>
            <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none font-bold">
              +12% vs Last Event
            </Badge>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_DATA}>
                <defs>
                  <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="checkins"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCheckins)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-6 rounded-[32px] border-none shadow-xl shadow-primary/5 bg-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Impact Funnel</h3>
              <p className="text-xs text-muted-foreground">Engagement metrics</p>
            </div>
          </div>
          <div className="space-y-6">
            {FUNNEL_DATA.map((item, index) => (
              <div key={item.name} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {item.name}
                  </span>
                  <span className="font-black text-sm">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(item.value / FUNNEL_DATA[0].value) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-dashed border-primary/10">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-bold text-primary">2.6%</span> of attendees made a first-time
              commitment today.
            </p>
          </div>
        </Card>

        {/* Financial Performance */}
        <Card className="col-span-1 lg:col-span-3 p-6 rounded-[32px] border-none shadow-xl shadow-primary/5 bg-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Financial Performance</h3>
                <p className="text-xs text-muted-foreground">Budget vs Actuals</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-[250px] col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FINANCIAL_DATA} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="budget" name="Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 flex flex-col justify-center">
              {FINANCIAL_DATA.map((item) => (
                <div
                  key={item.name}
                  className="p-4 rounded-2xl bg-muted/20 border border-primary/5"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      {item.name}
                    </span>
                    <span
                      className={`text-xs font-black ${item.actual >= item.budget ? 'text-emerald-500' : 'text-destructive'}`}
                    >
                      {((item.actual / item.budget) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-foreground">
                      ${item.actual.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground mb-1">
                      / ${item.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
