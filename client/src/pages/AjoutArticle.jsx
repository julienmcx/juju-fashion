import { Camera, Smartphone } from 'lucide-react';

export default function AjoutArticle() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-medium mb-2">Ajouter un article</h2>
      <p className="text-juju-texte-mute mb-8">Capture, enrichis, sauvegarde.</p>

      <div className="md:hidden text-center py-12 border border-juju-bordure rounded-xl">
        <Camera size={40} className="mx-auto mb-4 text-juju-dore" />
        <p className="font-medium mb-2">Capture à venir</p>
        <p className="text-sm text-juju-texte-mute px-6">
          L'écran de prise de photo et les formulaires seront prochainement disponibles.
        </p>
      </div>

      <div className="hidden md:block text-center py-16 border border-juju-bordure rounded-xl">
        <Smartphone size={40} className="mx-auto mb-4 text-juju-dore" />
        <p className="font-medium mb-2">Disponible sur mobile uniquement</p>
        <p className="text-sm text-juju-texte-mute max-w-md mx-auto">
          L'ajout d'article passe par la prise de photo. Connecte-toi depuis ton téléphone pour numériser ta garde-robe.
        </p>
      </div>
    </div>
  );
}