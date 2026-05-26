import { business } from '@/lib/business';

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl">Mentions légales</h1>
      <p className="mt-4"><strong>Éditeur :</strong> {business.name}</p>
      <p><strong>Adresse :</strong> {business.address}</p>
      <p><strong>Téléphone :</strong> {business.phone}</p>
      <p className="mt-4">Hébergement : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.</p>
      <p className="mt-4">Ce site est un site vitrine non transactionnel. Les articles présentés sont disponibles uniquement en boutique.</p>
    </article>
  );
}
