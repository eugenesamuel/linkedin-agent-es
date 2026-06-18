import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { TrendResearchAgent } from '@/lib/agents/TrendResearchAgent';
import { ContentWriterAgent } from '@/lib/agents/ContentWriterAgent';
import { BannerCreativeAgent } from '@/lib/agents/BannerCreativeAgent';
import { ComplianceReviewAgent } from '@/lib/agents/ComplianceReviewAgent';
import { PublisherAgent } from '@/lib/agents/PublisherAgent';

// This endpoint is meant to be hit by a Cron Job (e.g. Vercel Cron or Firebase Cloud Scheduler)
// To protect it, we expect a CRON_SECRET authorization header.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log("[Auto-Post Cron] Starting automation cycle...");

    // 1. Get the brand profile and verify it allows auto-posting
    const profileSnapshot = await db.collection('brand_profiles').limit(1).get();
    if (profileSnapshot.empty) {
      throw new Error("No brand profile found. Automation aborted.");
    }
    const brandProfile = profileSnapshot.docs[0].data();
    
    if (brandProfile.approval_required) {
      console.log("[Auto-Post Cron] Human approval is required. Stopping automation.");
      return NextResponse.json({ message: "Approval required. No auto-publish." });
    }

    // Assume we use a generic system user ID since we no longer query Prisma Users
    const systemUserId = "system_cron_bot";

    // 2. Fetch the latest trending topics (limit 1 for the daily post)
    console.log("[Auto-Post Cron] Researching topics...");
    const topics = await TrendResearchAgent.researchAndStoreTopics({
      industry: brandProfile.industry,
      audience: brandProfile.target_audience,
      region: "Global",
      limit: 1
    });

    if (topics.length === 0) {
      throw new Error("No trending topics found.");
    }
    const selectedTopic = topics[0];

    // 3. Generate Content Draft
    console.log("[Auto-Post Cron] Generating content for topic:", selectedTopic.title);
    const draft = await ContentWriterAgent.createDraft({
      userId: systemUserId,
      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,
      audience: brandProfile.target_audience,
      tone: brandProfile.tone_of_voice,
      language: brandProfile.language,
      contentGoal: "Engagement",
      brandProfile
    });

    // 4. Attach Banner
    console.log("[Auto-Post Cron] Generating banner...");
    await BannerCreativeAgent.attachBannerToDraft(draft.id, selectedTopic.title, brandProfile);

    // 5. Compliance Review
    console.log("[Auto-Post Cron] Running compliance check...");
    const review = await ComplianceReviewAgent.reviewDraft(draft.id, draft.post_text || "", brandProfile);

    // 6. Auto-Publish if Compliance Score is high enough (e.g. >= 80)
    if (review.score >= 80) {
      console.log("[Auto-Post Cron] Compliance passed. Auto-approving and publishing...");
      
      // Auto-approve the draft
      await db.collection('content_drafts').doc(draft.id).update({
        status: "APPROVED",
        updatedAt: new Date().toISOString()
      });

      // Publish immediately
      const publishedDraft = await PublisherAgent.publishDraft(draft.id, systemUserId, "company_page");
      
      console.log("[Auto-Post Cron] Successfully published!");
      return NextResponse.json({ 
        success: true, 
        message: "Successfully auto-published.",
        draftId: draft.id
      });
      
    } else {
      console.log(`[Auto-Post Cron] Compliance score too low (${review.score}). Draft created but left for human review.`);
      return NextResponse.json({ 
        success: false, 
        message: "Compliance score too low. Left as draft.",
        draftId: draft.id
      });
    }

  } catch (error: any) {
    console.error("[Auto-Post Cron] Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
