import { useState, useEffect } from 'react';
import { Shirt, SlidersHorizontal, Sparkles, X } from 'lucide-react';

const STEPS = [
  {
    icon: Shirt,
    title: 'Numérise ta garde-robe',
    text: "Prends en photo tes vêtements ou importe-les. L'IA détoure le fond si besoin, et chaque pièce rejoint ton dressing numérique.",
  },
  {
    icon: SlidersHorizontal,
    title: 'Organise et filtre',
    text: 'Catégories, couleurs, marques, statistiques de valeur… Retrouve chaque pièce en un instant et redécouvre ta garde-robe.',
  },
  {
    icon: Sparkles,
    title: 'Essaye virtuellement',
    text: 'Capture ton mannequin sous 4 angles, puis essaie n\'importe quel vêtement dessus. Fonctionnalité bêta, 2 essais par jour.',
  },
];

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem('juju_onboarding_seen')) {
      setOpen(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem('juju_onboarding_seen', '1');
    setOpen(false);
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-light-texte dark:hover:text-juju-texte transition-colors"
          aria-label="Passer"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-juju-dore/15 flex items-center justify-center mb-5">
            <Icon size={30} className="text-juju-dore" />
          </div>
          <p className="text-xs uppercase tracking-widest text-juju-violet font-bold mb-2">
            Bienvenue sur Juju ✦
          </p>
          <h2 className="text-xl md:text-2xl font-medium mb-3">{current.title}</h2>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">
            {current.text}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Étape ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-juju-dore' : 'w-2 bg-juju-light-bordure dark:bg-juju-bordure'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 px-4 py-2.5 border border-juju-light-bordure dark:border-juju-bordure rounded-lg hover:border-juju-dore transition-colors text-sm"
            >
              Précédent
            </button>
          )}
          <button
            onClick={() => (isLast ? close() : setStep((s) => s + 1))}
            className="flex-1 px-4 py-2.5 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors text-sm"
          >
            {isLast ? 'Commencer' : 'Suivant'}
          </button>
        </div>

        {!isLast && (
          <button
            onClick={close}
            className="w-full text-center text-xs text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore mt-4 transition-colors"
          >
            Passer l'introduction
          </button>
        )}
      </div>
    </div>
  );
}