import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Smartphone, Loader2 } from 'lucide-react';
import { uploadImage } from '../api/upload';
import { createArticle } from '../api/articles';
import {
  fetchCategories, fetchCouleurs, fetchMatieres, fetchMarques,
} from '../api/referentiels';
import ArticleForm from '../components/ArticleForm';

export default function AjoutArticle() {
  const navigate = useNavigate();

  const [step, setStep] = useState('capture');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
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
      .catch(() => {});
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImageUrl(url);
      setStep('form');
    } catch (err) {
      setUploadError(err.response?.data?.error || "Échec de l'upload.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (payload) => {
    const { article } = await createArticle(payload);
    navigate(`/articles/${article.id_article}`);
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
      {/* Desktop : message dédié, fonctionnalité bloquée */}
      <div className="hidden md:block text-center py-16 border border-juju-bordure rounded-xl">
        <Smartphone size={40} className="mx-auto mb-4 text-juju-dore" />
        <p className="font-medium mb-2">Disponible sur mobile uniquement</p>
        <p className="text-sm text-juju-texte-mute max-w-md mx-auto">
          L'ajout d'article passe par la prise de photo. Connecte-toi depuis ton téléphone pour numériser ta garde-robe.
        </p>
      </div>

      {/* Mobile : flow capture + form */}
      <div className="md:hidden">
        {step === 'capture' && (
          <div>
            <h2 className="text-2xl font-medium mb-2">Ajouter un article</h2>
            <p className="text-juju-texte-mute mb-8">
              Commence par une photo. Tu pourras ensuite décrire l'article.
            </p>

            <div className="space-y-3">
              <CaptureButton
                icon={Camera}
                label="Prendre une photo"
                hint="Ouvre l'appareil photo"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <CaptureButton
                icon={ImageIcon}
                label="Choisir depuis ma galerie"
                hint="Sélectionne une image existante"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div className="flex items-center gap-2 mt-6 text-sm text-juju-texte-mute">
                <Loader2 size={16} className="animate-spin" />
                Upload en cours…
              </div>
            )}

            {uploadError && (
              <p className="text-red-400 text-sm mt-4">{uploadError}</p>
            )}
          </div>
        )}

        {step === 'form' && (
          <div>
            <h2 className="text-2xl font-medium mb-2">Décris l'article</h2>
            <p className="text-juju-texte-mute mb-6">Remplis les champs principaux.</p>

            <div className="aspect-square w-32 mb-6 rounded-lg overflow-hidden bg-juju-bleu border border-juju-bordure">
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
      </div>
    </div>
  );
}

function CaptureButton({ icon: Icon, label, hint, accept, capture, onChange, disabled }) {
  return (
    <label
      className={`flex items-center gap-4 p-5 border border-juju-bordure rounded-xl cursor-pointer transition-colors ${
        disabled ? 'opacity-50 pointer-events-none' : 'hover:border-juju-dore'
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-juju-bleu border border-juju-bordure flex items-center justify-center text-juju-dore">
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-juju-texte-mute mt-0.5">{hint}</p>
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