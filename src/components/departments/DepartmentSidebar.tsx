
"use client";
import { Link, useLocation } from "react-router-dom";

const links = [
  { name: "Overview", href: "" },
  { name: "Members", href: "members" },
  { name: "Activities", href: "activities" },
  { name: "Reports", href: "reports" },
  { name: "Settings", href: "settings" },
];

export function DepartmentSidebar({ departmentSlug }: { departmentSlug: string }) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-4 border-b font-bold text-lg text-indigo-700 capitalize">
        {departmentSlug} Dept.
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const fullPath = `/dashboard/department/${departmentSlug}/${link.href}`;
          const active = location.pathname === fullPath;
          return (
            <Link
              key={link.name}
              to={fullPath}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                active ? "bg-indigo-100 text-indigo-800" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
