import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // User ID
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      console.error("LinkedIn Auth Error:", error, errorDescription);
      return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error)}`, req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/settings?error=missing_code", req.url));
    }

    // Fetch the user's settings to get the client id and secret
    const settings = await prisma.apiSettings.findUnique({
      where: { user_id: state },
    });

    if (!settings || !settings.linkedin_client_id || !settings.linkedin_client_secret) {
      return NextResponse.redirect(new URL("/settings?error=missing_credentials", req.url));
    }

    // Reconstruct the redirect URI
    const protocol = url.protocol;
    const host = url.host;
    const redirectUri = `${protocol}//${host}/api/auth/linkedin/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: settings.linkedin_client_id,
        client_secret: settings.linkedin_client_secret,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("LinkedIn Token Error:", tokenData);
      return NextResponse.redirect(new URL("/settings?error=token_exchange_failed", req.url));
    }

    // Calculate expiry
    const expiresIn = tokenData.expires_in || 0; // seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Save the token to the database
    await prisma.apiSettings.update({
      where: { user_id: state },
      data: {
        linkedin_access_token: tokenData.access_token,
        linkedin_refresh_token: tokenData.refresh_token || null,
        linkedin_token_expires_at: expiresAt,
      },
    });

    // Redirect back to settings page with success
    return NextResponse.redirect(new URL("/settings?success=linkedin_connected", req.url));
  } catch (error) {
    console.error("Error in LinkedIn Callback:", error);
    return NextResponse.redirect(new URL("/settings?error=internal_error", req.url));
  }
}
