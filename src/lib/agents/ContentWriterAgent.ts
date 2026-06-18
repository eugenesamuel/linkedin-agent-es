import { generateContent } from "../api-clients/internalContentApi";
import { prisma } from "../prisma";

export class ContentWriterAgent {
  static async createDraft(params: {
    userId: string;
    topicId: string;
    topicTitle: string;
    audience: string;
    tone: string;
    language: string;
    contentGoal: string;
    brandProfile: any;
  }) {
    // 1. Call internal content generation API
    const content = await generateContent({
      topic: params.topicTitle,
      audience: params.audience,
      tone: params.tone,
      language: params.language,
      content_goal: params.contentGoal,
      brand_profile: params.brandProfile
    });

    // 2. Store as a new ContentDraft in Prisma
    const draft = await prisma.contentDraft.create({
      data: {
        user_id: params.userId,
        topic_id: params.topicId,
        topic_title: params.topicTitle,
        post_text: content.post_text,
        hook: content.hook,
        hashtags: Array.isArray(content.hashtags) ? content.hashtags.join(" ") : content.hashtags,
        CTA: content.CTA,
        status: "DRAFT"
      }
    });

    return draft;
  }
}
