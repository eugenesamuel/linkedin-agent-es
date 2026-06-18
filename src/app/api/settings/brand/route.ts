import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const profile = await prisma.brandProfile.findFirst();
    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const existing = await prisma.brandProfile.findFirst();
    
    let profile;
    if (existing) {
      profile = await prisma.brandProfile.update({
        where: { id: existing.id },
        data: body
      });
    } else {
      profile = await prisma.brandProfile.create({
        data: {
          brand_name: body.brand_name || "Default Brand",
          industry: body.industry || "Technology",
          target_audience: body.target_audience || "Professionals",
          tone_of_voice: body.tone_of_voice || "Professional",
          language: body.language || "English",
          posting_frequency: body.posting_frequency || "Daily",
          CTA_style: body.CTA_style || "Direct",
          approval_required: true,
          ...body
        }
      });
    }
    
    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
