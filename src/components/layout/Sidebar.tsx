import Link from "next/link";
import { LayoutDashboard, FileText, Calendar, Settings, BarChart2, TrendingUp } from "lucide-react";

export function Sidebar() {
  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Topics", href: "/topics", icon: TrendingUp },
    { name: "Drafts", href: "/drafts", icon: FileText },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white shadow-xl">
      <div className="flex h-16 items-center px-6 font-bold text-xl tracking-wider text-blue-400">
        LinkAgent
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-blue-400" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
            US
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">User</p>
            <p className="text-xs font-medium text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
