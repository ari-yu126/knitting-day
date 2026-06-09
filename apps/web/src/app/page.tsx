import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureTeaserSection } from "@/components/landing/FeatureTeaserSection";
import { CommunityPreviewSection } from "@/components/landing/CommunityPreviewSection";
import { FaqPreviewSection } from "@/components/landing/FaqPreviewSection";
import { GuidePreviewSection } from "@/components/landing/GuidePreviewSection";
import { BannerSection } from "@/components/landing/BannerSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="text-font flex min-h-screen flex-1 flex-col font-sans">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeatureTeaserSection />
        <CommunityPreviewSection />
        <FaqPreviewSection />
        <GuidePreviewSection />
        <BannerSection />
      </main>
      <Footer />
    </div>
  );
}
