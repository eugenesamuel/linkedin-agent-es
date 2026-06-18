"use client";

import { useState, useEffect } from "react";
import { Plus, Settings2, Webhook, Image as ImageIcon, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Automation {
  id: string;
  topics: string[];
  schedule: string;
  include_image: boolean;
  webhook_url: string | null;
  status: string;
}

export default function DashboardPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [topicsStr, setTopicsStr] = useState("");
  const [schedule, setSchedule] = useState("Daily");
  const [includeImage, setIncludeImage] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await fetch("/api/automations");
      if (!res.ok) throw new Error("Failed to fetch automations");
      const data = await res.json();
      setAutomations(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load automations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const topicsArray = topicsStr.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    
    if (topicsArray.length === 0) {
      toast.error("Please enter at least one topic");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: topicsArray,
          schedule,
          include_image: includeImage,
          webhook_url: webhookUrl,
          api_key: apiKey,
        }),
      });

      if (!res.ok) throw new Error("Failed to create automation");
      
      toast.success("Automation created successfully!");
      setIsModalOpen(false);
      
      // Reset form
      setTopicsStr("");
      setSchedule("Daily");
      setIncludeImage(true);
      setWebhookUrl("");
      setApiKey("");
      
      // Refresh list
      fetchAutomations();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create automation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Create Automation</span>
        </button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-gray-500" />
            Active Automations
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading automations...</div>
        ) : automations.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Webhook className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">No automations found</p>
            <p className="text-sm">Create your first automation to start generating content.</p>
          </div>
        ) : (
          <div className="divide-y">
            {automations.map((auto) => (
              <div key={auto.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${auto.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {auto.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      Schedule: {auto.schedule}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Topics: <span className="text-gray-900 font-medium">{auto.topics.join(", ")}</span>
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" /> 
                      {auto.include_image ? "Includes Banner" : "Text Only"}
                    </span>
                    {auto.webhook_url && (
                      <span className="flex items-center gap-1">
                        <Webhook className="h-3 w-3" /> 
                        Connected to API
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <button className="text-sm text-blue-600 font-medium hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Card (keeping the original gradient card) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm p-6">
          <h2 className="font-semibold text-lg text-blue-900 mb-2">Quick Actions</h2>
          <p className="text-sm text-blue-700 mb-6">Generate new content manually or review pending drafts.</p>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Create New Automation</h3>
              <p className="text-sm text-gray-500 mt-1">Set up automated content generation.</p>
            </div>
            <form onSubmit={handleCreateAutomation} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Topics (comma separated)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. AI in Business, Leadership, Productivity"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={topicsStr}
                  onChange={(e) => setTopicsStr(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Schedule
                  </label>
                  <select 
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-center">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer mt-5">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={includeImage}
                      onChange={(e) => setIncludeImage(e.target.checked)}
                    />
                    Generate Image/Banner
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-gray-500" /> API Integration (Optional)
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 block">Webhook URL (n8n, Make, Custom API)</label>
                    <input 
                      type="url" 
                      placeholder="https://your-api.com/webhook/..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 block">API Key / Auth Token (Optional)</label>
                    <input 
                      type="password" 
                      placeholder="Bearer token or API Key"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Saving..." : "Save Automation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
