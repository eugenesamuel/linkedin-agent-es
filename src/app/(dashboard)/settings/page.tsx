"use client";

import { useState, useEffect } from "react";
import { Key, Lock, Save, Sparkles, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Gemini API
  const [geminiKey, setGeminiKey] = useState("");

  // LinkedIn API
  const [liAccessToken, setLiAccessToken] = useState("");
  const [liClientId, setLiClientId] = useState("");
  const [liClientSecret, setLiClientSecret] = useState("");
  const [liOrgId, setLiOrgId] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings/keys");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      
      setGeminiKey(data.gemini_api_key || "");
      setLiAccessToken(data.linkedin_access_token || "");
      setLiClientId(data.linkedin_client_id || "");
      setLiClientSecret(data.linkedin_client_secret || "");
      setLiOrgId(data.linkedin_organization_id || "");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load API settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gemini_api_key: geminiKey,
          linkedin_access_token: liAccessToken,
          linkedin_client_id: liClientId,
          linkedin_client_secret: liClientSecret,
          linkedin_organization_id: liOrgId,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("API Settings saved securely!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save API settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">API Settings</h1>
        <p className="text-gray-500 mt-2">Manage the connections to Google Gemini and LinkedIn for native automation.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Gemini Settings */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-blue-900">
              <Sparkles className="h-5 w-5" /> Google Gemini API
            </h2>
            <p className="text-sm text-blue-700 mt-1">Used by the agent to generate post content, hooks, and ideas.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" /> API Key
              </label>
              <input 
                type="password" 
                placeholder="AIzaSy..."
                className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Get your key from Google AI Studio.</p>
            </div>
          </div>
        </div>

        {/* LinkedIn Settings */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-blue-900">
              <LinkIcon className="h-5 w-5" /> LinkedIn API
            </h2>
            <p className="text-sm text-blue-700 mt-1">Used to natively publish generated content to your profile or page.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-400" /> Access Token
              </label>
              <input 
                type="password" 
                placeholder="AQX..."
                className="w-full max-w-2xl rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={liAccessToken}
                onChange={(e) => setLiAccessToken(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Client ID</label>
                <input 
                  type="text" 
                  placeholder="Optional"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={liClientId}
                  onChange={(e) => setLiClientId(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Client Secret</label>
                <input 
                  type="password" 
                  placeholder="Optional"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={liClientSecret}
                  onChange={(e) => setLiClientSecret(e.target.value)}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Organization ID (Company Page URN)</label>
                <input 
                  type="text" 
                  placeholder="Leave blank to post to personal profile"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={liOrgId}
                  onChange={(e) => setLiOrgId(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">If you want to post on behalf of a company, input the organization URN (e.g. 12345678).</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Settings..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
