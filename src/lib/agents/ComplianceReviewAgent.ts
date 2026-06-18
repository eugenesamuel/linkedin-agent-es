import { db } from "../firebase";

export class ComplianceReviewAgent {
  static async reviewDraft(draftId: string, postText: string, brandProfile: any) {
    let score = 100;
    const notes: string[] = [];

    const lowerText = postText.toLowerCase();

    // 1. Check banned words
    for (const word of brandProfile.banned_words || []) {
      if (lowerText.includes(word.toLowerCase())) {
        score -= 20;
        notes.push(`Contains banned word: ${word}`);
      }
    }

    // 2. Basic hallucination / policy check simulation
    if (lowerText.includes("guarantee") || lowerText.includes("100%")) {
      score -= 10;
      notes.push("Potentially exaggerated claims (e.g. 'guarantee' or '100%').");
    }

    if (score === 100) {
      notes.push("Passed all internal compliance checks cleanly.");
    }

    // 3. Update Draft with compliance score in Firestore
    await db.collection('content_drafts').doc(draftId).update({
      compliance_score: score,
      compliance_notes: notes.join(" | "),
      updatedAt: new Date().toISOString()
    });

    return { score, notes };
  }
}
