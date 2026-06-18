export async function fetchLatestTrends(params: {
  industry: string;
  audience: string;
  region: string;
  limit: number;
}) {
  const url = process.env.INTERNAL_TREND_API_URL || "http://internal.api/trends";
  
  // Simulated API call
  console.log(`[API Wrapper] Calling ${url} with`, params);
  
  // Return mocked realistic data
  return [
    { title: "The Rise of AI in " + params.industry, description: "How artificial intelligence is reshaping the industry.", score: 90, source: "InternalTrendAPI" },
    { title: "Sustainable Practices for " + params.audience, description: "Why eco-friendly operations matter more than ever.", score: 85, source: "InternalTrendAPI" },
    { title: "Leadership in 2026", description: "Adapting to the new remote-first world.", score: 75, source: "InternalTrendAPI" },
  ].slice(0, params.limit);
}
