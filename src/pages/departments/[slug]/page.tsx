
import { DepartmentStatsCard } from "@/components/departments/DepartmentStatsCard";

export default function DepartmentOverview({ params }: any) {
  const { slug } = params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold capitalize">{slug} Department Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DepartmentStatsCard title="Total Members" value="23" />
        <DepartmentStatsCard title="Active Meetings" value="3" />
        <DepartmentStatsCard title="Reports Submitted" value="7" />
        <DepartmentStatsCard title="Upcoming Events" value="2" />
      </div>
    </div>
  );
}
