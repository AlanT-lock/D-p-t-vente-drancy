import { Header } from '@/components/vitrine/header';
import { Footer } from '@/components/vitrine/footer';
import { HydrationCheck } from '@/components/vitrine/hydration-check';

export default function VitrineLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <HydrationCheck />
    </>
  );
}
