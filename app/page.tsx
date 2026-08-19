import { About } from "@/components/landing/About";
import { Hero } from "@/components/landing/Hero";
import { MenuPreview } from "@/components/landing/MenuPreview";
import { Reviews } from "@/components/landing/Reviews";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <main className="flex flex-1 flex-col">
        <Hero />
        <MenuPreview />
        <About />
        <Reviews />
      </main>
      <SiteFooter />
    </div>
  );
}
