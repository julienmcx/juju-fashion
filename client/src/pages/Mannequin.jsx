import { UserSquare } from 'lucide-react';

export default function Mannequin() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-medium mb-2">Mon mannequin</h2>
      <p className="text-juju-texte-mute mb-8">Génère ton avatar 360° et essaye virtuellement.</p>

      <div className="text-center py-16 border border-juju-bordure rounded-xl">
        <UserSquare size={40} className="mx-auto mb-4 text-juju-dore" />
        <p className="font-medium mb-2">Mannequin à venir</p>
        <p className="text-sm text-juju-texte-mute max-w-md mx-auto">
          La capture des 8 angles et la génération de l'avatar seront intégrées prochainement.
        </p>
      </div>
    </div>
  );
}