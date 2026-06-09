import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { uploadImage, removeBackground } from '../api/upload';
import { createArticle } from '../api/articles';
import {
  fetchCategories, fetchCouleurs, fetchMatieres, fetchMarques,
} from '../api/referentiels';
import ArticleForm from '../components/ArticleForm';
import { Button, PageHeader } from '../components/ui';

export default function AjoutArticle() {
  const navigate = useNavigate();

  const [step, setStep] = useState('capture');
  const [imageUrl, setImageUrl] = useState('');
  const [pendingImageUrl, setPendingImageUrl] = useState('');
  const [showDetourChoice, setShowDetourChoice] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [detouring, setDetouring] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [categories, setCategories] = useState([]);
  const [couleurs, setCouleurs] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [marques, setMarques] = useState([]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchCouleurs(), fetchMatieres(), fetchMarques()])
      .then(([cats, cols, mats, mqs]) => {
        setCategories(cats);
        setCouleurs(cols);
        setMatieres(mats);
        setMarques(mqs);
      })
      .catch(() => { });
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);

    try {
      const { url: originalUrl } = await uploadImage(file);
      setPendingImageUrl(originalUrl);
      setShowDetourChoice(true);
    } catch (err) {
      setUploadError(err.response?.data?.error || "Échec de l'upload.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDetour = async () => {
    setDetouring(true);
    try {
      const { url: cleanUrl } = await removeBackground(pendingImageUrl);
      setImageUrl(cleanUrl);
    } catch (bgErr) {
      console.warn('Détourage échoué, image originale conservée :', bgErr);
      setImageUrl(pendingImageUrl);
    } finally {
      setDetouring(false);
      setShowDetourChoice(false);
      setStep('form');
    }
  };

  const handleKeepAsIs = () => {
    setImageUrl(pendingImageUrl);
    setShowDetourChoice(false);
    setStep('form');
  };

  const handleSubmit = async (payload) => {
    const { article } = await createArticle(payload);
    navigate(`/articles/${article.id_article}`);
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
      {step === 'capture' && (
        <div className="animate-fade-up">
          <PageHeader
            eyebrow="Nouvel article"
            title={<>Ajouter un <span className="accent-italic">article</span></>}
            subtitle="Commence par une photo. Tu pourras ensuite décrire l'article."
          />

          <div className="space-y-3 max-w-md">
            <div className="md:hidden">
              <CaptureButton
                icon={Camera}
                label="Prendre une photo"
                hint="Ouvre l'appareil photo"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
            <CaptureButton
              icon={ImageIcon}
              label="Choisir un fichier"
              hint="Sélectionne une image existante"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="flex items-center gap-2 mt-6 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute">
              <Loader2 size={16} className="animate-spin text-juju-violet dark:text-juju-dore" />
              Upload de la photo…
            </div>
          )}

          {uploadError && (
            <p className="text-red-500 text-sm mt-4">{uploadError}</p>
          )}
        </div>
      )}

      {step === 'form' && (
        <div className="animate-fade-up">
          <h1 className="font-display text-3xl md:text-4xl leading-[1.08] text-juju-light-texte dark:text-juju-texte mb-2.5">
            Décris l'<span className="accent-italic">article</span>
          </h1>
          <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">Remplis les champs principaux.</p>

          <div className="aspect-square w-32 mb-6 rounded-2xl overflow-hidden bg-juju-light-card dark:bg-juju-bleu/40 border border-juju-light-bordure dark:border-juju-bordure shadow-card p-1.5">
            <img src={imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
          </div>

          <ArticleForm
            initialValues={{ image_url: imageUrl }}
            referentiels={{ categories, couleurs, matieres, marques }}
            setMarques={setMarques}
            onSubmit={handleSubmit}
            submitLabel="Créer l'article"
            onCancel={() => navigate('/garde-robe')}
          />
        </div>
      )}

      {/* Modale : choix du détourage */}
      {showDetourChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-juju-noir/50 backdrop-blur-sm">
          <div className="rounded-2xl bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="font-display text-xl leading-snug mb-2">Détourer le fond&nbsp;?</h3>
            <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-5">
              Si ta photo a déjà un fond uni (packshot, image d'un site marchand), garde-la telle quelle. Sinon, l'IA va isoler le vêtement proprement.
            </p>

            <div className="aspect-square w-40 mx-auto mb-5 rounded-2xl overflow-hidden bg-juju-light-bg dark:bg-juju-noir border border-juju-light-bordure dark:border-juju-bordure p-1.5">
              <img src={pendingImageUrl} alt="Aperçu" className="w-full h-full object-cover rounded-xl" />
            </div>

            <div className="space-y-2.5">
              <Button
                type="button"
                variant="primary"
                fullWidth
                icon={Sparkles}
                loading={detouring}
                onClick={handleDetour}
              >
                {detouring ? 'Détourage en cours…' : 'Détourer le fond (IA)'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                icon={ImageIcon}
                disabled={detouring}
                onClick={handleKeepAsIs}
              >
                Garder telle quelle
              </Button>
            </div>

            <p className="text-[11px] text-center text-juju-light-texte-mute dark:text-juju-texte-mute mt-4">
              Le détourage IA consomme un crédit FASHN.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CaptureButton({ icon: Icon, label, hint, accept, capture, onChange, disabled }) {
  return (
    <label
      className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all bg-juju-light-card dark:bg-juju-bleu/40 border border-juju-light-bordure dark:border-juju-bordure shadow-card ${disabled ? 'opacity-50 pointer-events-none' : 'hover:border-juju-violet hover:-translate-y-0.5 hover:shadow-card-hover'
        }`}
    >
      <div className="w-12 h-12 rounded-xl bg-juju-violet/10 dark:bg-juju-dore/10 flex items-center justify-center text-juju-violet dark:text-juju-dore shrink-0">
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-0.5">{hint}</p>
      </div>
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