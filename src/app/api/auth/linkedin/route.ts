import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getDefaultUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { email: "admin@example.com", name: "Admin User", role: "admin" },
    });
  }
  return user;
}

export async function GET(req: Request) {
  try {
    const user = await getDefaultUser();
    const settings = await prisma.apiSettings.findUnique({
      where: { user_id: user.id },
    });

    if (!settings?.linkedin_client_id) {
      return NextResponse.json({ error: "LinkedIn Client ID is missing. Please save it in settings first." }, { status: 400 });
    }

    // Determine scopes
    let scope = "w_member_social profile openid email";
    if (settings.linkedin_organization_id) {
      scope = "w_organization_social profile openid email";
    }

    // Construct the URL
    // To ensure the callback matches what's configured in LinkedIn, we construct it dynamically or hardcode to vercel
    const url = new URL(req.url);
    const host = url.host;
    const protocol = url.protocol; // http: or https:
    const redirectUri = `${protocol}//${host}/api/auth/linkedin/callback`;

    const state = user.id; // CSRF protection and identifying the user in callback

    const linkedinAuthUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    linkedinAuthUrl.searchParams.append("response_type", "code");
    linkedinAuthUrl.searchParams.append("client_id", settings.linkedin_client_id);
    linkedinAuthUrl.searchParams.append("redirect_uri", redirectUri);
    linkedinAuthUrl.searchParams.append("state", state);
    linkedinAuthUrl.searchParams.append("scope", scope);

    // Redirect to LinkedIn
    return NextResponse.redirect(linkedinAuthUrl.toString());
  } catch (error) {
    console.error("Error initiating LinkedIn OAuth:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
