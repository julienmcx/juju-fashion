import { useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, Check, X, Smartphone, Loader2, RefreshCw } from 'lucide-react';
import {
  fetchAvatarPhotos,
  uploadAvatarPhoto,
  deleteAvatarPhoto,
} from '../api/avatar';

const ANGLES = [
  { key: 'face',          label: 'Face',         instruction: 'Place-toi face à la caméra, bras le long du corps' },
  { key: 'profil_droit',  label: 'Profil droit', instruction: 'Tourne-toi à 90° sur ta droite' },
  { key: 'dos',           label: 'De dos',       instruction: 'Tourne-toi complètement, dos à la caméra' },
  { key: 'profil_gauche', label: 'Profil gauche',instruction: 'Tourne-toi à 90° sur ta gauche' },
];

export default function Mannequin() {
  const [photos, setPhotos] = useState({});         // { face: {...}, dos: {...} }
  const [loading, setLoading] = useState(true);
  const [uploadingAngle, setUploadingAngle] = useState(null);
  const [activeAngle, setActiveAngle] = useState('face');
  const [error, setError] = useState('');

  const loadPhotos = async () => {
    try {
      const data = await fetchAvatarPhotos();
      const map = {};
      data.photos.forEach((p) => { map[p.angle] = p; });
      setPhotos(map);
      // Auto-jump sur le premier angle pas encore capturé
      const next = ANGLES.find((a) => !map[a.key]);
      if (next) setActiveAngle(next.key);
    } catch {
      setError('Impossible de charger les photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPhotos(); }, []);

  const handleFileChange = async (e, angle) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploadingAngle(angle);
    try {
      const photo = await uploadAvatarPhoto(file, angle);
      setPhotos((prev) => ({ ...prev, [angle]: photo }));
      // Passe au prochain angle non capturé
      const next = ANGLES.find((a) => a.key !== angle && !photos[a.key]);
      if (next) setActiveAngle(next.key);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload échoué.');
    } finally {
      setUploadingAngle(null);
      e.target.value = '';
    }
  };

  const handleDelete = async (angle) => {
    try {
      await deleteAvatarPhoto(angle);
      setPhotos((prev) => {
        const copy = { ...prev };
        delete copy[angle];
        return copy;
      });
      setActiveAngle(angle);
    } catch {
      setError('Suppression impossible.');
    }
  };

  const completed = ANGLES.filter((a) => photos[a.key]).length;
  const allDone = completed === ANGLES.length;

  if (loading) {
    return <div className="px-4 py-20 text-center text-juju-texte-mute">Chargement…</div>;
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
      {/* Desktop : message dédié */}
      <div className="hidden md:block text-center py-16 border border-juju-bordure rounded-xl">
        <Smartphone size={40} className="mx-auto mb-4 text-juju-dore" />
        <p className="font-medium mb-2">Disponible sur mobile uniquement</p>
        <p className="text-sm text-juju-texte-mute max-w-md mx-auto">
          La capture du mannequin nécessite l'appareil photo de ton téléphone.
          Connecte-toi depuis ton mobile pour configurer ton avatar.
        </p>
      </div>

      {/* Mobile : capture des 4 angles */}
      <div className="md:hidden">
        <h2 className="text-2xl font-medium mb-2">Mon mannequin</h2>
        <p className="text-juju-texte-mute mb-6">
          Capture-toi sous 4 angles pour créer ton avatar virtuel. Tu ne le feras qu'une fois.
        </p>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-juju-texte-mute mb-2">
            <span>Progression</span>
            <span>{completed} / {ANGLES.length}</span>
          </div>
          <div className="h-2 bg-juju-bleu border border-juju-bordure rounded-full overflow-hidden">
            <div
              className="h-full bg-juju-dore transition-all duration-300"
              style={{ width: `${(completed / ANGLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Grille des 4 angles */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ANGLES.map((angle) => {
            const photo = photos[angle.key];
            const isActive = activeAngle === angle.key && !photo;
            return (
              <AngleCard
                key={angle.key}
                angle={angle}
                photo={photo}
                isActive={isActive}
                onSelect={() => setActiveAngle(angle.key)}
                onDelete={() => handleDelete(angle.key)}
              />
            );
          })}
        </div>

        {/* Bloc capture pour l'angle actif (si pas déjà capturé) */}
        {!photos[activeAngle] && (
          <div className="p-5 border border-juju-dore/40 bg-juju-dore/5 rounded-xl mb-4">
            <p className="text-xs uppercase tracking-wider text-juju-dore mb-2">
              Étape {ANGLES.findIndex((a) => a.key === activeAngle) + 1} / {ANGLES.length}
            </p>
            <p className="font-medium mb-1">
              {ANGLES.find((a) => a.key === activeAngle)?.label}
            </p>
            <p className="text-sm text-juju-texte-mute mb-4">
              {ANGLES.find((a) => a.key === activeAngle)?.instruction}
            </p>

            <div className="space-y-2">
              <CaptureButton
                icon={Camera}
                label="Prendre une photo"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileChange(e, activeAngle)}
                disabled={uploadingAngle !== null}
              />
              <CaptureButton
                icon={ImageIcon}
                label="Choisir depuis ma galerie"
                accept="image/*"
                onChange={(e) => handleFileChange(e, activeAngle)}
                disabled={uploadingAngle !== null}
              />
            </div>

            {uploadingAngle === activeAngle && (
              <div className="flex items-center gap-2 mt-4 text-sm text-juju-texte-mute">
                <Loader2 size={16} className="animate-spin" />
                Upload en cours…
              </div>
            )}
          </div>
        )}

        {allDone && (
          <div className="p-5 border border-green-500/30 bg-green-500/5 rounded-xl text-center">
            <Check size={32} className="mx-auto mb-2 text-green-400" />
            <p className="font-medium mb-1">Mannequin prêt</p>
            <p className="text-sm text-juju-texte-mute">
              Tu peux maintenant essayer virtuellement les vêtements de ta garde-robe.
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}

function AngleCard({ angle, photo, isActive, onSelect, onDelete }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
        photo
          ? 'border-juju-dore/60'
          : isActive
          ? 'border-juju-dore'
          : 'border-juju-bordure hover:border-juju-texte-mute'
      }`}
    >
      {photo ? (
        <>
          <img src={photo.image_url} alt={angle.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-juju-dore text-juju-noir flex items-center justify-center">
            <Check size={14} />
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-juju-noir/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
            aria-label={`Supprimer ${angle.label}`}
          >
            <X size={14} />
          </button>
          <p className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium">
            {angle.label}
          </p>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-juju-bleu/40 p-3">
          <Camera size={28} className={`mb-2 ${isActive ? 'text-juju-dore' : 'text-juju-texte-mute'}`} />
          <p className="text-xs text-center font-medium">{angle.label}</p>
          {isActive && (
            <p className="text-[10px] text-juju-dore mt-1 uppercase tracking-wider">À capturer</p>
          )}
        </div>
      )}
    </button>
  );
}

function CaptureButton({ icon: Icon, label, accept, capture, onChange, disabled }) {
  return (
    <label
      className={`flex items-center gap-3 p-3 border border-juju-bordure rounded-lg bg-juju-noir cursor-pointer transition-colors ${
        disabled ? 'opacity-50 pointer-events-none' : 'hover:border-juju-dore'
      }`}
    >
      <Icon size={18} className="text-juju-dore" />
      <span className="text-sm font-medium">{label}</span>
      <input
        type="file"
        accept={accept}
        capture={capture}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
    </label>
  );
}