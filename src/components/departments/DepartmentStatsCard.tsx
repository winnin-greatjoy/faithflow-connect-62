
export function DepartmentStatsCard({ title, value }: { title: string; value: string }) {
    return (
      <div className="bg-white shadow-md rounded-xl p-4 text-center hover:shadow-lg transition">
        <h2 className="text-sm text-gray-500">{title}</h2>
        <p className="text-2xl font-bold text-indigo-700 mt-1">{value}</p>
      </div>
    );
  }
  