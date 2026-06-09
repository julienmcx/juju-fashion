import LegalLayout, { LegalSection } from '../components/LegalLayout';

export default function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdated="juin 2026">
      <LegalSection title="Préambule">
        <p>
          La présente politique décrit comment l'Application <strong>Juju</strong> collecte, utilise
          et protège tes données personnelles, conformément au Règlement Général sur la Protection
          des Données (RGPD).
        </p>
      </LegalSection>

      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement est <strong>[Julien Michaux]</strong>, éditeur de l'Application.
          Contact : <strong>[julienmichaux2006@gmail.com]</strong>.
        </p>
      </LegalSection>

      <LegalSection title="Données collectées">
        <p>Dans le cadre de l'utilisation de l'Application, nous collectons :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ton <strong>adresse e-mail</strong> et ton <strong>pseudo</strong> (lors de l'inscription) ;</li>
          <li>Ton <strong>mot de passe</strong>, stocké de manière chiffrée (haché via bcrypt, jamais en clair) ;</li>
          <li>Les <strong>photos de vêtements</strong> que tu importes dans ta garde-robe ;</li>
          <li>Les <strong>photos de ton mannequin</strong> (4 angles) si tu utilises l'essayage virtuel ;</li>
          <li>L'<strong>historique de tes essayages</strong> que tu choisis de sauvegarder.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Finalités du traitement">
        <p>Ces données sont utilisées uniquement pour :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Te permettre de créer et gérer ta garde-robe numérique ;</li>
          <li>Générer des essayages virtuels via notre prestataire d'IA ;</li>
          <li>Sécuriser ton compte et t'authentifier.</li>
        </ul>
        <p>Tes données ne sont <strong>jamais revendues</strong> ni utilisées à des fins publicitaires.</p>
      </LegalSection>

      <LegalSection title="Base légale">
        <p>
          Le traitement repose sur ton <strong>consentement</strong> (création de compte) et sur
          l'<strong>exécution du service</strong> que tu demandes en utilisant l'Application.
        </p>
      </LegalSection>

      <LegalSection title="Sous-traitants">
        <p>
          Pour la fonctionnalité d'essayage virtuel, les images sont transmises à notre prestataire
          d'intelligence artificielle <strong>FASHN AI</strong>, le temps du traitement. Aucune autre
          donnée personnelle (e-mail, identité) ne lui est communiquée.
        </p>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <p>
          Tes données sont conservées tant que ton compte est actif. Tu peux supprimer ton contenu
          (articles, mannequin, essayages) à tout moment depuis l'Application. La suppression de ton
          compte entraîne l'effacement de l'ensemble de tes données.
        </p>
      </LegalSection>

      <LegalSection title="Tes droits">
        <p>Conformément au RGPD, tu disposes des droits suivants :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Droit d'accès, de rectification et d'effacement de tes données ;</li>
          <li>Droit à la portabilité et à la limitation du traitement ;</li>
          <li>Droit d'opposition au traitement.</li>
        </ul>
        <p>
          Pour exercer ces droits, contacte-nous à <strong>[julienmichaux2006@gmail.com]</strong>.
          Tu peux également introduire une réclamation auprès de la CNIL (cnil.fr).
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          Les mots de passe sont hachés (bcrypt), les échanges sont chiffrés via HTTPS, et l'accès
          à tes données est protégé par authentification (jeton JWT). Seul toi as accès à ton contenu.
        </p>
      </LegalSection>

      <LegalSection title="Stockage local">
        <p>
          L'Application utilise le stockage local de ton navigateur (localStorage) uniquement pour
          mémoriser ta session (jeton d'authentification) et tes préférences d'affichage (thème, densité).
          Aucun cookie publicitaire ni traceur tiers n'est utilisé.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}