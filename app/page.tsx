import { Hero } from "@/components/hero/Hero";
import { IntroSection } from "@/components/sections/IntroSection";
import { MenuSection } from "@/components/sections/MenuSection";
import { SignatureDish } from "@/components/sections/SignatureDish";
import { AboutSection } from "@/components/sections/AboutSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { Testimonials } from "@/components/sections/Testimonials";
import { SundayRoast } from "@/components/sections/SundayRoast";
import { VisitSection } from "@/components/sections/VisitSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-offwhite">
      <main className="flex flex-1 flex-col">
        <Hero />
        <IntroSection />
        <MenuSection />
        <SignatureDish />
        <AboutSection />
        <GallerySection />
        <Testimonials />
        <SundayRoast />
        <VisitSection />
      </main>
      <Footer />
    </div>
  );
}
