import { generateBanner } from "../api-clients/internalBannerApi";
import { db } from "../firebase";

export class BannerCreativeAgent {
  static async attachBannerToDraft(draftId: string, topicTitle: string, brandProfile: any) {
    // 1. Generate Banner prompt based on topic
    const prompt = `Professional LinkedIn banner for topic: ${topicTitle}, using ${brandProfile.brand_name} brand colors and style.`;

    // 2. Call Internal Banner API
    const bannerResponse = await generateBanner({
      prompt,
      size: "1200x627",
      brand_style: brandProfile,
      text_overlay: topicTitle
    });

    // 3. Store BannerAsset in Firestore
    const bannerRef = db.collection('banner_assets').doc();
    const bannerData = {
      id: bannerRef.id,
      url: bannerResponse.url,
      asset_id: bannerResponse.asset_id,
      prompt: prompt,
      createdAt: new Date().toISOString()
    };
    await bannerRef.set(bannerData);

    // 4. Update Draft
    await db.collection('content_drafts').doc(draftId).update({ 
      banner_asset_id: bannerRef.id,
      banner_asset_url: bannerResponse.url,
      updatedAt: new Date().toISOString()
    });

    return bannerData;
  }
}
