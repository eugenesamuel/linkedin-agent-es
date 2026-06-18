"use client";

import { useState } from "react";
import { TrendingUp, RefreshCw, PlusCircle } from "lucide-react";

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trends/latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: "Tech", audience: "Founders" })
      });
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createDraft = async (topicId: string, topicTitle: string) => {
    alert("Draft creation simulated for: " + topicTitle);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Trending Topics</h1>
          <p className="text-gray-500 mt-1">AI-scored topics tailored for your audience.</p>
        </div>
        <button 
          onClick={fetchTopics}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
          Discover Trends
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, i) => (
          <div key={i} className="rounded-xl border bg-white shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
                  Score: {topic.score}
                </span>
                <span className="text-xs text-gray-400 font-medium">Internal API</span>
              </div>
              <h3 className="font-semibold text-lg leading-snug mb-2">{topic.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{topic.description}</p>
            </div>
            
            <button 
              onClick={() => createDraft(topic.id, topic.title)}
              className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <PlusCircle className="mr-2 h-4 w-4 text-blue-500" />
              Generate Post Draft
            </button>
          </div>
        ))}

        {!loading && topics.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed rounded-xl">
            Click "Discover Trends" to fetch the latest topics from the internal API.
          </div>
        )}
      </div>
    </div>
  );
}
