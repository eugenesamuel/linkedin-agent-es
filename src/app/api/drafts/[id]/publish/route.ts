import { NextResponse } from 'next/server';
import { PublisherAgent } from '@/lib/agents/PublisherAgent';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId, publishAs } = await req.json();

    // First ensure it is approved
    await prisma.contentDraft.update({
      where: { id },
      data: { status: "APPROVED" }
    });

    const publishedDraft = await PublisherAgent.publishDraft(id, userId, publishAs || "company_page");
    
    return NextResponse.json({ success: true, draft: publishedDraft });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
