import { db } from "../firebase";

export class SchedulerAgent {
  static suggestBestTime() {
    const date = new Date();
    date.setDate(date.getDate() + (date.getDay() === 2 ? 2 : (date.getDay() >= 4 ? (9 - date.getDay()) : (2 - date.getDay()))));
    date.setHours(10, 0, 0, 0);
    return date;
  }

  static async scheduleDraft(draftId: string, scheduledDate: Date) {
    await db.collection('content_drafts').doc(draftId).update({
      status: "SCHEDULED",
      scheduled_at: scheduledDate.toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const draftDoc = await db.collection('content_drafts').doc(draftId).get();
    return draftDoc.data();
  }
}
