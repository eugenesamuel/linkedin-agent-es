import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock auth for draft purposes
async function getDefaultUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      },
    });
  }
  return user;
}

export async function GET() {
  try {
    const user = await getDefaultUser();
    let settings = await prisma.apiSettings.findUnique({
      where: { user_id: user.id },
    });
    
    // Create empty settings if none exist
    if (!settings) {
      settings = await prisma.apiSettings.create({
        data: { user_id: user.id }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching API settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getDefaultUser();
    const data = await req.json();

    const { gemini_api_key, linkedin_access_token, linkedin_client_id, linkedin_client_secret, linkedin_organization_id } = data;

    const updatedSettings = await prisma.apiSettings.upsert({
      where: { user_id: user.id },
      update: {
        gemini_api_key,
        linkedin_access_token,
        linkedin_client_id,
        linkedin_client_secret,
        linkedin_organization_id,
      },
      create: {
        user_id: user.id,
        gemini_api_key,
        linkedin_access_token,
        linkedin_client_id,
        linkedin_client_secret,
        linkedin_organization_id,
      },
    });

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error) {
    console.error("Error saving API settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
