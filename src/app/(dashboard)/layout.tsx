import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
