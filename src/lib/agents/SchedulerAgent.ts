import { prisma } from "../prisma";

export class SchedulerAgent {
  static suggestBestTime() {
    const date = new Date();
    date.setDate(date.getDate() + (date.getDay() === 2 ? 2 : (date.getDay() >= 4 ? (9 - date.getDay()) : (2 - date.getDay()))));
    date.setHours(10, 0, 0, 0);
    return date;
  }

  static async scheduleDraft(draftId: string, scheduledDate: Date) {
    const draft = await prisma.contentDraft.update({
      where: { id: draftId },
      data: {
        status: "SCHEDULED",
        scheduled_at: scheduledDate
      }
    });
    
    return draft;
  }
}
