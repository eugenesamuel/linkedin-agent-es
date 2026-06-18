import { generateContent } from "../api-clients/internalContentApi";
import { db } from "../firebase";

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

    // 2. Store as a new ContentDraft in Firestore
    const draftRef = db.collection('content_drafts').doc();
    const draftData = {
      id: draftRef.id,
      user_id: params.userId,
      topic_id: params.topicId,
      topic_title: params.topicTitle,
      post_text: content.post_text,
      hook: content.hook,
      hashtags: content.hashtags,
      CTA: content.CTA,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await draftRef.set(draftData);
    return draftData;
  }
}
