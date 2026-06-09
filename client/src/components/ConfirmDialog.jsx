import { X } from 'lucide-react';
import { Button } from './ui';

export default function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-juju-noir/50 backdrop-blur-sm">
      <div className="rounded-2xl bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure shadow-2xl p-6 max-w-sm w-full animate-scale-in">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-display text-xl leading-snug">{title}</h3>
          <button
            onClick={onCancel}
            disabled={loading}
            aria-label="Fermer"
            className="-mr-1 -mt-1 p-1.5 rounded-lg text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-violet dark:hover:text-juju-dore hover:bg-juju-light-bordure/50 dark:hover:bg-juju-bordure/50 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="md" disabled={loading} onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            size="md"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
