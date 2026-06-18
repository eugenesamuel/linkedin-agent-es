import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await db.collection('content_drafts').doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ draft: doc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await db.collection('content_drafts').doc(id).update({
      ...body,
      updatedAt: new Date().toISOString()
    });
    
    const doc = await db.collection('content_drafts').doc(id).get();
    return NextResponse.json({ draft: doc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
