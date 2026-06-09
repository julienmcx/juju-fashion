import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { uploadImage, removeBackground } from '../api/upload';
import { createArticle } from '../api/articles';
import {
  fetchCategories, fetchCouleurs, fetchMatieres, fetchMarques,
} from '../api/referentiels';
import ArticleForm from '../components/ArticleForm';

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
        <div>
          <h2 className="text-2xl md:text-3xl font-medium mb-2">Ajouter un article</h2>
          <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-8">
            Commence par une photo. Tu pourras ensuite décrire l'article.
          </p>

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
              <Loader2 size={16} className="animate-spin" />
              Upload de la photo…
            </div>
          )}

          {uploadError && (
            <p className="text-red-400 text-sm mt-4">{uploadError}</p>
          )}
        </div>
      )}

      {step === 'form' && (
        <div>
          <h2 className="text-2xl md:text-3xl font-medium mb-2">Décris l'article</h2>
          <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">Remplis les champs principaux.</p>

          <div className="aspect-square w-32 mb-6 rounded-lg overflow-hidden bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure">
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-medium mb-2">Détourer le fond&nbsp;?</h3>
            <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-5">
              Si ta photo a déjà un fond uni (packshot, image d'un site marchand), garde-la telle quelle. Sinon, l'IA va isoler le vêtement proprement.
            </p>

            <div className="aspect-square w-40 mx-auto mb-5 rounded-lg overflow-hidden bg-juju-light-bg dark:bg-juju-noir border border-juju-light-bordure dark:border-juju-bordure">
              <img src={pendingImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDetour}
                disabled={detouring}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors disabled:opacity-60"
              >
                {detouring ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Détourage en cours…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Détourer le fond (IA)
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleKeepAsIs}
                disabled={detouring}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-juju-light-bordure dark:border-juju-bordure rounded-lg hover:border-juju-dore transition-colors disabled:opacity-60"
              >
                <ImageIcon size={16} />
                Garder telle quelle
              </button>
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
      className={`flex items-center gap-4 p-5 border border-juju-light-bordure dark:border-juju-bordure rounded-xl cursor-pointer transition-colors ${disabled ? 'opacity-50 pointer-events-none' : 'hover:border-juju-dore'
        }`}
    >
      <div className="w-12 h-12 rounded-full bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure flex items-center justify-center text-juju-dore">
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
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