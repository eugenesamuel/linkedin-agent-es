import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ContentWriterAgent } from '@/lib/agents/ContentWriterAgent';
import { ComplianceReviewAgent } from '@/lib/agents/ComplianceReviewAgent';
import { BannerCreativeAgent } from '@/lib/agents/BannerCreativeAgent';

export async function GET() {
  try {
    const snapshot = await db.collection('content_drafts').orderBy('createdAt', 'desc').get();
    const drafts = snapshot.docs.map((doc: any) => doc.data());
    return NextResponse.json({ drafts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, topicId, topicTitle, audience, tone, language, contentGoal, brandProfile } = await req.json();
    
    // 1. Generate Content
    const draft = await ContentWriterAgent.createDraft({
      userId, topicId, topicTitle, audience, tone, language, contentGoal, brandProfile
    });

    // 2. Attach Banner
    await BannerCreativeAgent.attachBannerToDraft(draft.id, topicTitle, brandProfile);

    // 3. Review Compliance
    await ComplianceReviewAgent.reviewDraft(draft.id, draft.post_text || "", brandProfile);

    return NextResponse.json({ success: true, draftId: draft.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
