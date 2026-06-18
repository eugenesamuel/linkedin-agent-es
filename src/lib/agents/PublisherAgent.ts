import { publishToLinkedIn } from "../api-clients/internalLinkedinApi";
import { prisma } from "../prisma";

export class PublisherAgent {
  static async publishDraft(draftId: string, userId: string, publishAs: string) {
    const draft = await prisma.contentDraft.findUnique({ where: { id: draftId } });
    if (!draft) throw new Error("Draft not found");

    if (draft.status !== "APPROVED" && draft.status !== "SCHEDULED") {
      throw new Error("Draft must be APPROVED or SCHEDULED before publishing");
    }

    try {
      // 1. Call internal API
      const result = await publishToLinkedIn({
        post_text: draft.post_text || "",
        asset_id: draft.banner_asset_id || undefined,
        publish_as: publishAs,
        scheduled_at: draft.scheduled_at || undefined
      });

      // 2. Update Draft Status
      const updatedDraft = await prisma.contentDraft.update({
        where: { id: draftId },
        data: {
          status: result.status === "scheduled" ? "SCHEDULED" : "PUBLISHED",
          published_at: result.status === "published" ? new Date() : null
        }
      });

      // 3. Create PublishedPost record if published immediately
      if (result.status === "published") {
        await prisma.publishedPost.create({
          data: {
            draft_id: draftId,
            linkedin_id: result.linkedin_id
          }
        });
      }

      // 4. Log Audit
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          action: "PUBLISH_POST",
          entity_id: draftId,
          details: { linkedin_id: result.linkedin_id, status: result.status }
        }
      });

      return updatedDraft;
    } catch (error: any) {
      await prisma.contentDraft.update({
        where: { id: draftId },
        data: { status: "FAILED" }
      });
      throw error;
    }
  }
}
