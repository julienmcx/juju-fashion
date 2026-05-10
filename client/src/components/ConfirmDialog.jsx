import { X } from 'lucide-react';

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
  const confirmClasses = {
    primary: 'bg-juju-dore text-juju-noir hover:bg-juju-dore-clair',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }[confirmVariant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-juju-bleu border border-juju-bordure rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-juju-texte-mute hover:text-juju-texte"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-juju-texte-mute mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm border border-juju-bordure text-juju-texte rounded-lg hover:bg-juju-bleu-clair transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmClasses}`}
          >
            {loading ? '…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}