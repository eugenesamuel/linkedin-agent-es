import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    // Return first brand profile if it exists
    const snapshot = await db.collection('brand_profiles').limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json({ profile: null });
    }
    return NextResponse.json({ profile: snapshot.docs[0].data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const snapshot = await db.collection('brand_profiles').limit(1).get();
    
    let profileData = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await docRef.update(profileData);
      profileData = { ...snapshot.docs[0].data(), ...profileData };
    } else {
      const newRef = db.collection('brand_profiles').doc();
      profileData = {
        id: newRef.id,
        brand_name: body.brand_name || "Default Brand",
        industry: body.industry || "Technology",
        target_audience: body.target_audience || "Professionals",
        tone_of_voice: body.tone_of_voice || "Professional",
        language: body.language || "English",
        posting_frequency: body.posting_frequency || "Daily",
        CTA_style: body.CTA_style || "Direct",
        approval_required: true,
        createdAt: new Date().toISOString(),
        ...profileData
      };
      await newRef.set(profileData);
    }
    
    return NextResponse.json({ profile: profileData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
