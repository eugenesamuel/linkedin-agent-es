import { publishToLinkedIn } from "../api-clients/internalLinkedinApi";
import { db } from "../firebase";

export class PublisherAgent {
  static async publishDraft(draftId: string, userId: string, publishAs: string) {
    const draftRef = db.collection('content_drafts').doc(draftId);
    const draftDoc = await draftRef.get();

    if (!draftDoc.exists) throw new Error("Draft not found");
    const draft = draftDoc.data()!;

    if (draft.status !== "APPROVED" && draft.status !== "SCHEDULED") {
      throw new Error("Draft must be APPROVED or SCHEDULED before publishing");
    }

    try {
      // 1. Call internal API
      const result = await publishToLinkedIn({
        post_text: draft.post_text || "",
        asset_id: draft.banner_asset_id || undefined, // we assume asset_id matches here
        publish_as: publishAs,
        scheduled_at: draft.scheduled_at ? new Date(draft.scheduled_at) : undefined
      });

      // 2. Update Draft Status
      await draftRef.update({
        status: result.status === "scheduled" ? "SCHEDULED" : "PUBLISHED",
        published_at: result.status === "published" ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      });

      // 3. Create PublishedPost record if published immediately
      if (result.status === "published") {
        await db.collection('published_posts').add({
          draft_id: draftId,
          linkedin_id: result.linkedin_id,
          published_at: new Date().toISOString()
        });
      }

      // 4. Log Audit
      await db.collection('audit_logs').add({
        user_id: userId,
        action: "PUBLISH_POST",
        entity_id: draftId,
        details: { linkedin_id: result.linkedin_id, status: result.status },
        createdAt: new Date().toISOString()
      });

      const updatedDraft = await draftRef.get();
      return updatedDraft.data();
    } catch (error: any) {
      await draftRef.update({ status: "FAILED", updatedAt: new Date().toISOString() });
      throw error;
    }
  }
}
