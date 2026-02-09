import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
