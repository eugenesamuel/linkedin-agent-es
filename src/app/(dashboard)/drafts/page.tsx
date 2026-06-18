"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, CheckCircle, Clock, Send, XCircle } from "lucide-react";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/drafts")
      .then((res) => res.json())
      .then((data) => {
        setDrafts(data.drafts || []);
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "SCHEDULED": return <Clock className="h-4 w-4 text-blue-500" />;
      case "PUBLISHED": return <Send className="h-4 w-4 text-purple-500" />;
      case "FAILED": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Content Drafts</h1>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl w-full"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Topic</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Compliance Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drafts.map((draft) => (
                <tr key={draft.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {draft.topic?.title || "Unknown Topic"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(draft.status)}
                      <span className="font-medium text-gray-700">{draft.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      draft.compliance_score >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {draft.compliance_score || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/drafts/${draft.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                      Review & Publish
                    </Link>
                  </td>
                </tr>
              ))}
              {drafts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No drafts found. Go to Topics to generate a new draft.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
