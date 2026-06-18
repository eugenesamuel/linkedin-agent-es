import { generateBanner } from "../api-clients/internalBannerApi";
import { prisma } from "../prisma";

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

    // 3. Store BannerAsset in Prisma
    const bannerAsset = await prisma.bannerAsset.create({
      data: {
        url: bannerResponse.url,
        asset_id: bannerResponse.asset_id,
        prompt: prompt
      }
    });

    // 4. Update Draft
    await prisma.contentDraft.update({
      where: { id: draftId },
      data: {
        banner_asset_id: bannerAsset.id,
        banner_asset_url: bannerAsset.url
      }
    });

    return bannerAsset;
  }
}
