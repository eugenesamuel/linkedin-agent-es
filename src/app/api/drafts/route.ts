import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContentWriterAgent } from '@/lib/agents/ContentWriterAgent';
import { ComplianceReviewAgent } from '@/lib/agents/ComplianceReviewAgent';
import { BannerCreativeAgent } from '@/lib/agents/BannerCreativeAgent';

export async function GET() {
  try {
    const drafts = await prisma.contentDraft.findMany({
      orderBy: { createdAt: 'desc' }
    });
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
    const updatedDraft = await prisma.contentDraft.findUnique({ where: { id: draft.id } });
    await ComplianceReviewAgent.reviewDraft(draft.id, updatedDraft?.post_text || "", brandProfile);

    return NextResponse.json({ success: true, draftId: draft.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
