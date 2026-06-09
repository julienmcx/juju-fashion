import LegalLayout, { LegalSection } from '../components/LegalLayout';

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales" lastUpdated="juin 2026">
      <LegalSection title="Éditeur du site">
        <p>
          Le site <strong>Juju</strong> (ci-après « l'Application ») est édité par <strong>[Julien Michaux]</strong>,
          dans le cadre d'un projet étudiant à but non commercial.
        </p>
        <p>Contact : <strong>[julienmichaux2006@gmail.com]</strong></p>
      </LegalSection>

      <LegalSection title="Hébergeur">
        <p>
          L'Application est hébergée par <strong>o2switch</strong>, SAS au capital de 100 000 €,
          dont le siège social est situé au 222-224 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand, France.
        </p>
        <p>Téléphone : 04 44 44 60 40 — Site : o2switch.fr</p>
        <p className="italic text-xs">
          (Vérifie les coordonnées exactes de l'hébergeur sur o2switch.fr avant publication.)
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L'ensemble des éléments de l'Application (structure, design, textes, logo, code source)
          est la propriété de son éditeur, sauf mention contraire. Toute reproduction ou représentation,
          totale ou partielle, sans autorisation est interdite.
        </p>
        <p>
          Les photographies de vêtements et les images personnelles importées restent la propriété
          exclusive de leurs utilisateurs.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          L'Application est un projet étudiant fourni « en l'état », sans garantie de disponibilité
          ou d'absence d'erreur. La fonctionnalité d'essayage virtuel repose sur une intelligence
          artificielle dont les rendus sont approximatifs et fournis à titre indicatif.
        </p>
        <p>
          L'éditeur ne saurait être tenu responsable des décisions d'achat prises sur la base
          de ces rendus.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement de tes données personnelles est détaillé dans notre{' '}
          <a href="/confidentialite" className="text-juju-dore hover:underline">Politique de confidentialité</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}