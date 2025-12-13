import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { DistrictHealthData } from './DistrictHealthTable';

interface SystemAlertsWidgetProps {
  districts: DistrictHealthData[];
  orphanedBranchesCount: number;
}

export const SystemAlertsWidget: React.FC<SystemAlertsWidgetProps> = ({
  districts,
  orphanedBranchesCount,
}) => {
  const missingOverseers = districts.filter((d) => !d.hasOverseer);
  const missingHQs = districts.filter((d) => !d.hasHQ);

  const alerts = [
    ...missingOverseers.map((d) => ({
      id: `overseer-${d.id}`,
      type: 'critical',
      title: 'Missing District Overseer',
      message: `District "${d.name}" has no assigned Overseer.`,
    })),
    ...missingHQs.map((d) => ({
      id: `hq-${d.id}`,
      type: 'warning',
      title: 'Missing District HQ',
      message: `District "${d.name}" has no designated Headquarters branch.`,
    })),
    ...(orphanedBranchesCount > 0
      ? [
          {
            id: 'orphans',
            type: 'warning',
            title: 'Unassigned Branches',
            message: `${orphanedBranchesCount} branches are not assigned to any district.`,
          },
        ]
      : []),
  ];

  if (alerts.length === 0) {
    return (
      <Card className="border-green-100 bg-green-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-green-700">
            <Info className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600">All governance checks passed. System is healthy.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Governance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg flex items-start gap-3 ${
              alert.type === 'critical'
                ? 'bg-red-50 text-red-900 border border-red-100'
                : 'bg-yellow-50 text-yellow-900 border border-yellow-100'
            }`}
          >
            {alert.type === 'critical' ? (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm">{alert.title}</p>
              <p className="text-sm opacity-90">{alert.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
