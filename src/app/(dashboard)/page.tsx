export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder Stats */}
        {['Total Drafts', 'Pending Approval', 'Scheduled Posts', 'Total Impressions'].map((stat, i) => (
          <div key={i} className="rounded-xl border bg-white text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">{stat}</h3>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {i === 3 ? "12,450" : Math.floor(Math.random() * 20)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="text-sm text-gray-500 italic">No recent activity.</div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm p-6">
          <h2 className="font-semibold text-lg text-blue-900 mb-2">Quick Actions</h2>
          <p className="text-sm text-blue-700 mb-6">Generate new content or review pending drafts.</p>
          <div className="space-y-3">
            <a href="/topics" className="block w-full text-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
              Research New Topics
            </a>
            <a href="/drafts" className="block w-full text-center rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition">
              Review Drafts
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
