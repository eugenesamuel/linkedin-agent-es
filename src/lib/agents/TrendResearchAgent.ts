import { fetchLatestTrends } from "../api-clients/internalTrendApi";
import { db } from "../firebase";

export class TrendResearchAgent {
  static async researchAndStoreTopics(params: { industry: string; audience: string; region: string; limit: number }) {
    // 1. Fetch from internal API
    const rawTrends = await fetchLatestTrends(params);
    
    // 2. Score and filter
    const validTrends = rawTrends.filter(t => t.score > 60);

    // 3. Store in Firestore database
    const createdTopics = [];
    for (const t of validTrends) {
      const topicRef = db.collection('topics').doc();
      const topicData = {
        id: topicRef.id,
        title: t.title,
        description: t.description,
        score: t.score,
        source: t.source,
        reason: `High relevance score (${t.score}) for ${params.industry}`,
        createdAt: new Date().toISOString()
      };
      
      await topicRef.set(topicData);
      createdTopics.push(topicData);
    }
    
    return createdTopics;
  }
}
