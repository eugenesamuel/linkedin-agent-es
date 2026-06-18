import { NextResponse } from 'next/server';
import { TrendResearchAgent } from '@/lib/agents/TrendResearchAgent';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industry, audience, region, limit } = body;
    const topics = await TrendResearchAgent.researchAndStoreTopics({
      industry: industry || "Technology",
      audience: audience || "Professionals",
      region: region || "Global",
      limit: limit || 10
    });
    return NextResponse.json({ topics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
