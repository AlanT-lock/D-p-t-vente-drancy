import { Header } from '@/components/vitrine/header';
import { Footer } from '@/components/vitrine/footer';
import { SearchTrigger } from '@/components/vitrine/search-trigger';
import { HydrationCheck } from '@/components/vitrine/hydration-check';

export default function VitrineLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* DIAG TEMP : bouton de secours HORS du header sticky */}
      <div className="bg-yellow-300 px-4 py-3 flex items-center justify-center gap-3 text-sm font-bold">
        <span>SECOURS :</span>
        <SearchTrigger />
        <span>← tape ici</span>
      </div>
      <main>{children}</main>
      <Footer />
      <HydrationCheck />
    </>
  );
}
