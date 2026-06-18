import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In a real app, you would get the user ID from the session (e.g. NextAuth)
// For this draft, we'll fetch the first user or create a mock user if none exists.
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
    const automations = await prisma.automation.findMany({
      where: { user_id: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(automations);
  } catch (error) {
    console.error("Error fetching automations:", error);
    return NextResponse.json({ error: "Failed to fetch automations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getDefaultUser();
    const data = await req.json();

    const { topics, schedule, include_image, webhook_url, api_key } = data;

    if (!topics || topics.length === 0 || !schedule) {
      return NextResponse.json({ error: "Topics and schedule are required" }, { status: 400 });
    }

    const newAutomation = await prisma.automation.create({
      data: {
        user_id: user.id,
        topics,
        schedule,
        include_image: include_image ?? true,
        webhook_url: webhook_url || null,
        api_key: api_key || null,
      },
    });

    return NextResponse.json(newAutomation, { status: 201 });
  } catch (error) {
    console.error("Error creating automation:", error);
    return NextResponse.json({ error: "Failed to create automation" }, { status: 500 });
  }
}
