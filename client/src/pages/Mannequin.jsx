import { useEffect, useState } from 'react';
import {
  Camera, Image as ImageIcon, Check, X,
  Loader2, ChevronLeft, ChevronRight, Edit3,
} from 'lucide-react';
import {
  fetchAvatarPhotos,
  uploadAvatarPhoto,
  deleteAvatarPhoto,
} from '../api/avatar';

const ANGLES = [
  { key: 'face', label: 'Face', instruction: 'Place-toi face à la caméra, bras le long du corps' },
  { key: 'profil_droit', label: 'Profil droit', instruction: 'Tourne-toi à 90° sur ta gauche' },
  { key: 'dos', label: 'De dos', instruction: 'Tourne-toi complètement, dos à la caméra' },
  { key: 'profil_gauche', label: 'Profil gauche', instruction: 'Tourne-toi à 90° sur ta droite' },
];

export default function Mannequin() {
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const loadPhotos = async () => {
    try {
      const data = await fetchAvatarPhotos();
      const map = {};
      data.photos.forEach((p) => { map[p.angle] = p; });
      setPhotos(map);
    } catch {
      setError('Impossible de charger les photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPhotos(); }, []);

  const completed = ANGLES.filter((a) => photos[a.key]).length;
  const allDone = completed === ANGLES.length;

  if (loading) {
    return <div className="px-4 py-20 text-center text-juju-light-texte-mute dark:text-juju-texte-mute">Chargement…</div>;
  }

  if (allDone && !editMode) {
    return (
      <MannequinViewer
        photos={photos}
        onEdit={() => setEditMode(true)}
      />
    );
  }

  return (
    <CaptureView
      photos={photos}
      completed={completed}
      error={error}
      setError={setError}
      onUploaded={loadPhotos}
      onDeleted={loadPhotos}
      onCancel={() => setEditMode(false)}
      isEditing={editMode}
    />
  );
}

/* ============================================================
   VIEWER — visible mobile + desktop, mannequin avec swiper 360°
   ============================================================ */
function MannequinViewer({ photos, onEdit }) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % ANGLES.length);
  const prev = () => setIndex((i) => (i - 1 + ANGLES.length) % ANGLES.length);

  const currentAngle = ANGLES[index];
  const currentPhoto = photos[currentAngle.key];

  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
    setTouchStart(null);
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-medium">Mon mannequin</h2>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mt-1">Fais défiler pour tourner autour</p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore transition-colors"
        >
          <Edit3 size={16} />
          Modifier
        </button>
      </div>

      <div
        className="relative aspect-[3/4] max-w-md mx-auto bg-juju-light-card dark:bg-juju-bleu rounded-2xl overflow-hidden border border-juju-light-bordure dark:border-juju-bordure mb-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentPhoto.image_url}
          alt={currentAngle.label}
          className="w-full h-full object-cover transition-opacity duration-200"
          key={currentAngle.key}
        />
        <button
          onClick={prev}
          aria-label="Angle précédent"
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-juju-light-bg/80 dark:bg-juju-noir/70 backdrop-blur-sm border border-juju-light-bordure dark:border-juju-bordure items-center justify-center text-juju-light-texte dark:text-juju-texte hover:text-juju-dore transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          aria-label="Angle suivant"
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-juju-light-bg/80 dark:bg-juju-noir/70 backdrop-blur-sm border border-juju-light-bordure dark:border-juju-bordure items-center justify-center text-juju-light-texte dark:text-juju-texte hover:text-juju-dore transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-white">
            {currentAngle.label}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {ANGLES.map((a, i) => (
          <button
            key={a.key}
            onClick={() => setIndex(i)}
            aria-label={`Voir ${a.label}`}
            className={`h-2 rounded-full transition-all ${i === index
              ? 'w-8 bg-juju-dore'
              : 'w-2 bg-juju-light-bordure dark:bg-juju-bordure hover:bg-juju-light-texte-mute dark:hover:bg-juju-texte-mute'
              }`}
          />
        ))}
      </div>

      <div className="hidden md:grid grid-cols-4 gap-3 max-w-md mx-auto">
        {ANGLES.map((a, i) => (
          <button
            key={a.key}
            onClick={() => setIndex(i)}
            className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${i === index ? 'border-juju-dore' : 'border-juju-light-bordure dark:border-juju-bordure opacity-60 hover:opacity-100'
              }`}
          >
            <img src={photos[a.key].image_url} alt={a.label} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   CAPTURE — accessible mobile + desktop
   Mobile : 2 boutons (caméra + galerie)
   Desktop : 1 seul bouton (upload fichier)
   ============================================================ */
function CaptureView({
  photos, completed, error, setError, onUploaded, onDeleted, onCancel, isEditing,
}) {
  const [activeAngle, setActiveAngle] = useState(() => {
    const next = ANGLES.find((a) => !photos[a.key]);
    return next ? next.key : 'face';
  });
  const [uploadingAngle, setUploadingAngle] = useState(null);

  const handleFileChange = async (e, angle) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploadingAngle(angle);
    try {
      await uploadAvatarPhoto(file, angle);
      await onUploaded();
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
      await onDeleted();
      setActiveAngle(angle);
    } catch {
      setError('Suppression impossible.');
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl md:text-3xl font-medium">Mon mannequin</h2>
        {isEditing && (
          <button onClick={onCancel} className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore">
            Terminer
          </button>
        )}
      </div>
      <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">
        {isEditing
          ? 'Modifie tes 4 photos d\'angle.'
          : 'Configure ton avatar virtuel sous 4 angles. Tu ne le feras qu\'une fois.'}
      </p>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mb-2">
          <span>Progression</span>
          <span>{completed} / {ANGLES.length}</span>
        </div>
        <div className="h-2 bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-full overflow-hidden">
          <div
            className="h-full bg-juju-dore transition-all duration-300"
            style={{ width: `${(completed / ANGLES.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {ANGLES.map((angle) => (
          <AngleCard
            key={angle.key}
            angle={angle}
            photo={photos[angle.key]}
            isActive={activeAngle === angle.key && !photos[angle.key]}
            onSelect={() => setActiveAngle(angle.key)}
            onDelete={() => handleDelete(angle.key)}
          />
        ))}
      </div>

      {!photos[activeAngle] && (
        <div className="p-5 border border-juju-dore/40 bg-juju-dore/5 rounded-xl mb-4 max-w-md">
          <p className="text-xs uppercase tracking-wider text-juju-dore mb-2">
            Étape {ANGLES.findIndex((a) => a.key === activeAngle) + 1} / {ANGLES.length}
          </p>
          <p className="font-medium mb-1">
            {ANGLES.find((a) => a.key === activeAngle)?.label}
          </p>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-4">
            {ANGLES.find((a) => a.key === activeAngle)?.instruction}
          </p>

          <div className="space-y-2">
            {/* Caméra : mobile-only */}
            <div className="md:hidden">
              <CaptureButton
                icon={Camera}
                label="Prendre une photo"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileChange(e, activeAngle)}
                disabled={uploadingAngle !== null}
              />
            </div>
            {/* Upload fichier : partout */}
            <CaptureButton
              icon={ImageIcon}
              label="Choisir un fichier"
              accept="image/*"
              onChange={(e) => handleFileChange(e, activeAngle)}
              disabled={uploadingAngle !== null}
            />
          </div>

          {uploadingAngle === activeAngle && (
            <div className="flex items-center gap-2 mt-4 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute">
              <Loader2 size={16} className="animate-spin" />
              Upload en cours…
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-4">{error}</p>
      )}
    </div>
  );
}

/* ============================================================
   Composants utilitaires
   ============================================================ */
function AngleCard({ angle, photo, isActive, onSelect, onDelete }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${photo
        ? 'border-juju-dore/60'
        : isActive
          ? 'border-juju-dore'
          : 'border-juju-light-bordure dark:border-juju-bordure hover:border-juju-light-texte-mute dark:hover:border-juju-texte-mute'
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
            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
            aria-label={`Supprimer ${angle.label}`}
          >
            <X size={14} />
          </button>
          <p className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-white">
            {angle.label}
          </p>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-juju-light-card dark:bg-juju-bleu/40 p-3">
          <Camera size={28} className={`mb-2 ${isActive ? 'text-juju-dore' : 'text-juju-light-texte-mute dark:text-juju-texte-mute'}`} />
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
      className={`flex items-center gap-3 p-3 border border-juju-light-bordure dark:border-juju-bordure rounded-lg bg-juju-light-card dark:bg-juju-noir cursor-pointer transition-colors ${disabled ? 'opacity-50 pointer-events-none' : 'hover:border-juju-dore'
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