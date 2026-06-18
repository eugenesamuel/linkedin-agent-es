import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  return await handleRun(req);
}

export async function GET(req: Request) {
  return await handleRun(req);
}

async function handleRun(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    let automations = [];
    if (id) {
      automations = await prisma.automation.findMany({ where: { id, status: "ACTIVE" } });
    } else {
      // Find all active automations
      automations = await prisma.automation.findMany({ where: { status: "ACTIVE" } });
      // In a real cron, we would filter by lastRunAt and schedule frequency
    }

    if (automations.length === 0) {
      return NextResponse.json({ message: "No active automations to run" });
    }

    for (const auto of automations) {
      // 1. Fetch API settings for the user
      const settings = await prisma.apiSettings.findUnique({
        where: { user_id: auto.user_id },
      });

      if (!settings || !settings.gemini_api_key || !settings.linkedin_access_token) {
        console.error(`Missing API keys for user ${auto.user_id}`);
        continue; // Skip this one
      }

      // 2. Generate Post with Gemini
      const prompt = `Write an engaging, professional LinkedIn post about the following topics: ${auto.topics.join(", ")}. 
      It should be well-structured with short paragraphs and a few relevant hashtags. Do not include any placeholder text.`;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.gemini_api_key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const geminiData = await geminiRes.json();
      if (!geminiRes.ok) {
        console.error("Gemini Error:", geminiData);
        continue;
      }

      const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        console.error("Failed to extract text from Gemini response");
        continue;
      }

      // 3. Post to LinkedIn
      // First, get the LinkedIn Person ID (or use Organization ID)
      let authorUrn = "";
      if (settings.linkedin_organization_id) {
        authorUrn = `urn:li:organization:${settings.linkedin_organization_id}`;
      } else {
        const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { "Authorization": `Bearer ${settings.linkedin_access_token}` },
        });
        const profileData = await profileRes.json();
        if (profileData.sub) {
          authorUrn = `urn:li:person:${profileData.sub}`;
        } else {
          console.error("Failed to fetch LinkedIn profile ID:", profileData);
          continue;
        }
      }

      // Create the UGC Post
      const linkedinRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.linkedin_access_token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: authorUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: generatedText
              },
              shareMediaCategory: "NONE"
            }
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
          }
        }),
      });

      if (!linkedinRes.ok) {
        const liError = await linkedinRes.json();
        console.error("LinkedIn Post Error:", liError);
        continue;
      }

      // 4. Update lastRunAt
      await prisma.automation.update({
        where: { id: auto.id },
        data: { lastRunAt: new Date() }
      });
    }

    return NextResponse.json({ success: true, message: "Automations processed" });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
