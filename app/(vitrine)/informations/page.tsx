import { MapPin } from 'lucide-react';

export const metadata = {
  title: 'Informations',
  description:
    'Dépôt-Vente de Drancy : meubles neufs et d’occasion, décoration et friperie de qualité à prix attractifs. Horaires, accès et informations pratiques.',
};

export default function InformationsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-[2px] text-bronze font-semibold">
        Dépôt-vente · Drancy
      </p>
      <h1 className="font-serif text-3xl md:text-4xl mt-3">
        Meubles, Décoration et Friperie de Qualité
      </h1>

      <p className="mt-6 leading-relaxed text-bronze">
        Bienvenue au Dépôt-Vente de Drancy, votre adresse incontournable pour l’achat et la
        vente de meubles, d’objets de décoration et de vêtements de seconde main à Drancy.
      </p>
      <p className="mt-4 leading-relaxed text-bronze">
        Découvrez une sélection soigneusement choisie de meubles neufs et d’occasion, ainsi
        qu’un espace friperie proposant des vêtements et accessoires à prix attractifs.
      </p>

      <h2 className="font-serif text-2xl mt-10">Une référence pour les bonnes affaires à Drancy</h2>
      <p className="mt-3 leading-relaxed text-bronze">
        Que vous soyez à la recherche d’un meuble vintage, d’une décoration originale ou d’une
        pièce de mode unique, notre dépôt-vente vous propose des articles de qualité à des tarifs
        compétitifs.
      </p>

      <h2 className="font-serif text-2xl mt-10">Pourquoi nous choisir ?</h2>
      <ul className="mt-3 space-y-2 text-bronze">
        {[
          'Des prix attractifs toute l’année',
          'Une sélection rigoureuse de meubles, décoration et vêtements',
          'Des arrivages réguliers et des pièces uniques',
          'Un service client attentif et disponible',
          'Un large choix de styles : moderne, vintage, classique et tendance',
        ].map((item) => (
          <li key={item} className="flex gap-2 leading-relaxed">
            <span className="text-brass" aria-hidden="true">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 className="font-serif text-2xl mt-10">Espace Friperie</h2>
      <p className="mt-3 leading-relaxed text-bronze">
        Notre friperie est devenue l’une des adresses appréciées des amateurs de mode de seconde
        main en Seine-Saint-Denis. Vous y trouverez des vêtements, chaussures et accessoires
        sélectionnés pour leur qualité, leur style et leur excellent rapport qualité-prix.
      </p>
      <p className="mt-3 leading-relaxed">
        <span className="font-semibold">Horaire d’ouverture :</span> du jeudi au samedi de 13h à 18h.
      </p>

      <h2 className="font-serif text-2xl mt-10">Meubles neufs et d’occasion</h2>
      <p className="mt-3 leading-relaxed text-bronze">
        Nous proposons également des meubles neufs pouvant présenter de légers défauts esthétiques.
        Ces particularités sont prises en compte dans nos prix afin de vous permettre de réaliser de
        véritables économies.
      </p>
      <p className="mt-3 leading-relaxed text-bronze">
        Nous vous invitons à venir découvrir les articles sur place afin d’apprécier leur état et
        leurs finitions avant tout achat.
      </p>

      <h2 className="font-serif text-2xl mt-10">Informations pratiques</h2>
      <div className="mt-4 rounded-lg border border-navy/10 bg-parchment-light p-5">
        <p className="flex items-center gap-2 font-serif text-lg">
          <MapPin className="size-4 text-brass" aria-hidden="true" />
          Dépôt-Vente de Drancy
        </p>
        <p className="mt-1 text-bronze">3 rue de la Butte – 93700 Drancy</p>

        <h3 className="font-serif text-base mt-5 mb-1">Horaires d’ouverture</h3>
        <ul className="space-y-1 text-bronze">
          <li>Jeudi à samedi : 10h00 – 18h00 (sans interruption)</li>
          <li>Dimanche : 14h00 – 18h00</li>
        </ul>

        <h3 className="font-serif text-base mt-5 mb-1">Accès</h3>
        <ul className="space-y-1 text-bronze">
          <li>RER B : Le Bourget à 2 minutes</li>
          <li>A86 : Sortie 12 – porte de la Villette</li>
          <li>À 15 min de Paris</li>
        </ul>
      </div>
    </article>
  );
}
