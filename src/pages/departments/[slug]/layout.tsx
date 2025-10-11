// app/dashboard/department/[slug]/layout.tsx
import { DepartmentSidebar } from "@/components/departments/DepartmentSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  const handleMenuToggle = () => {
    // Handle sidebar toggle for mobile
    console.log('Menu toggle clicked');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DepartmentSidebar departmentSlug="default" />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        <AdminHeader onMenuToggle={handleMenuToggle} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
