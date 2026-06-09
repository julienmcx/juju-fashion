import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ChevronLeft, ChevronRight, AlertCircle, Loader2, RefreshCw, BookmarkPlus, Check } from 'lucide-react';
import { fetchArticle } from '../api/articles';
import { fetchAvatarPhotos } from '../api/avatar';
import { createTryOn, fetchQuota } from '../api/tryon';
import { saveEssayage } from '../api/essayages';

const REQUIRED_ANGLES = ['face', 'profil_droit', 'dos', 'profil_gauche'];
const ANGLE_LABELS = {
  face: 'Face',
  profil_droit: 'Profil droit',
  dos: 'De dos',
  profil_gauche: 'Profil gauche',
};

export default function ArticleEssai() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Données de pré-vol
  const [article, setArticle] = useState(null);
  const [avatarReady, setAvatarReady] = useState(false);
  const [quota, setQuota] = useState(null);
  const [loadingPrechecks, setLoadingPrechecks] = useState(true);
  const [preErr, setPreErr] = useState('');

  // État de l'essayage
  const [step, setStep] = useState('ready');     // 'ready' | 'generating' | 'success' | 'error'
  const [tryonData, setTryonData] = useState(null);
  const [tryonError, setTryonError] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      fetchArticle(id),
      fetchAvatarPhotos(),
      fetchQuota(),
    ])
      .then(([articleData, photosData, quotaData]) => {
        setArticle(articleData.article);
        const angles = photosData.photos.map((p) => p.angle);
        setAvatarReady(REQUIRED_ANGLES.every((a) => angles.includes(a)));
        setQuota(quotaData);
      })
      .catch((err) => {
        setPreErr(err.response?.status === 404 ? 'Article introuvable.' : 'Erreur de chargement.');
      })
      .finally(() => setLoadingPrechecks(false));
  }, [id]);

  const handleLaunch = async () => {
    setStep('generating');
    setTryonError('');
    try {
      const data = await createTryOn(id);
      setTryonData(data);
      setIndex(0);
      setStep('success');
    } catch (err) {
      setTryonError(err.response?.data?.error || 'Erreur durant l\'essayage.');
      setStep('error');
    }
  };


  if (loadingPrechecks) {
    return <CenteredMessage>Chargement…</CenteredMessage>;
  }

  if (preErr) {
    return (
      <CenteredMessage error>
        <p className="mb-4">{preErr}</p>
        <Link to="/garde-robe" className="text-juju-dore hover:underline">
          Retour à ma garde-robe
        </Link>
      </CenteredMessage>
    );
  }

  if (!avatarReady) {
    return (
      <PreFlightBlock
        icon={AlertCircle}
        title="Mannequin incomplet"
        message="Tu dois d'abord capturer ton mannequin sous les 4 angles pour pouvoir essayer des vêtements."
        ctaLabel="Configurer mon mannequin"
        ctaTo="/mannequin"
        articleId={id}
      />
    );
  }

  if (quota.remaining <= 0) {
    return (
      <PreFlightBlock
        icon={AlertCircle}
        title="Limite quotidienne atteinte"
        message={`Tu as utilisé tes ${quota.limit} essayages des dernières 24 heures. Réessaie plus tard.`}
        articleId={id}
      />
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <Link
        to={`/articles/${id}`}
        className="flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Retour au détail
      </Link>

      {step === 'ready' && (
        <ReadyView
          article={article}
          quota={quota}
          onLaunch={handleLaunch}
        />
      )}

      {step === 'generating' && <GeneratingView />}

      {step === 'error' && (
        <ErrorView
          message={tryonError}
          onRetry={() => setStep('ready')}
          articleId={id}
        />
      )}

      {step === 'success' && tryonData && (
        <SuccessView
          tryonData={tryonData}
          index={index}
          setIndex={setIndex}
          onRetry={handleLaunch}
        />
      )}
    </div>
  );
}


function ReadyView({ article, quota, onLaunch }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl md:text-3xl font-medium">Essayage virtuel</h2>
        <span className="px-2 py-0.5 bg-juju-violet text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
          Bêta
        </span>
      </div>
      <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-2">
        Voyons à quoi tu ressembles avec cet article.
      </p>
      <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mb-8 italic">
        ⚠️ Fonctionnalité expérimentale. Le rendu IA peut être approximatif selon les angles et morphologies.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
        <div>
          <p className="text-xs uppercase tracking-wider text-juju-light-texte-mute dark:text-juju-texte-mute mb-2 text-center">
            Article
          </p>
          <div className="aspect-square bg-juju-light-card dark:bg-juju-bleu rounded-xl overflow-hidden border border-juju-light-bordure dark:border-juju-bordure">
            <img src={article.image_url} alt={article.nom} className="w-full h-full object-cover" />
          </div>
          <p className="text-sm font-medium mt-2 text-center truncate">{article.nom}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-juju-light-texte-mute dark:text-juju-texte-mute mb-2 text-center">
            Sur toi
          </p>
          <div className="aspect-square bg-juju-light-card dark:bg-juju-bleu rounded-xl overflow-hidden border border-juju-light-bordure dark:border-juju-bordure flex items-center justify-center">
            <Sparkles size={36} className="text-juju-dore" />
          </div>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mt-2 text-center">4 angles · ~25 s</p>
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={onLaunch}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors"
        >
          <Sparkles size={20} />
          Lancer l'essayage
        </button>
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-3">
          Il te reste {quota.remaining} essayage{quota.remaining > 1 ? 's' : ''} aujourd'hui
        </p>
      </div>
    </div>
  );
}

function GeneratingView() {
  return (
    <div className="text-center py-20">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-juju-light-bordure dark:border-juju-bordure" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-juju-dore border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto text-juju-dore" size={28} />
      </div>
      <h3 className="text-xl font-medium mb-2">Génération en cours…</h3>
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute max-w-sm mx-auto">
        Le modèle IA s'occupe de ton look. Cette opération prend généralement entre 20 et 40 secondes.
      </p>
    </div>
  );
}

function SuccessView({ tryonData, index, setIndex, onRetry }) {
  // Tous les useState en haut (Rules of Hooks)
  const [touchStart, setTouchStart] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const orderedResults = REQUIRED_ANGLES
    .map((angle) => tryonData.results.find((r) => r.angle === angle))
    .filter(Boolean);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      await saveEssayage(tryonData.id_essayage);
      setSaved(true);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (orderedResults.length === 0) {
    return <p className="text-red-400 text-center py-10">Aucun résultat exploitable.</p>;
  }

  const current = orderedResults[index] || orderedResults[0];
  const next = () => setIndex((i) => (i + 1) % orderedResults.length);
  const prev = () => setIndex((i) => (i - 1 + orderedResults.length) % orderedResults.length);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
    setTouchStart(null);
  };

  const partialWarning = tryonData.errors && tryonData.errors.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-medium">Essayage généré</h2>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mt-1">Fais défiler pour tourner autour</p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore transition-colors"
        >
          <RefreshCw size={16} />
          Refaire
        </button>
      </div>

      {partialWarning && (
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mb-4 text-center">
          {tryonData.errors.length} angle{tryonData.errors.length > 1 ? 's' : ''} indisponible(s).
        </p>
      )}

      <div
        className="relative aspect-[3/4] max-w-md mx-auto bg-juju-light-card dark:bg-juju-bleu rounded-2xl overflow-hidden border border-juju-light-bordure dark:border-juju-bordure mb-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={current.image_url}
          alt={ANGLE_LABELS[current.angle]}
          className="w-full h-full object-cover"
          key={current.angle}
        />
        <button
          onClick={prev}
          aria-label="Angle précédent"
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-juju-light-bg dark:bg-juju-noir/70 backdrop-blur-sm border border-juju-light-bordure dark:border-juju-bordure items-center justify-center text-juju-light-texte dark:text-juju-texte hover:text-juju-dore transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          aria-label="Angle suivant"
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-juju-light-bg dark:bg-juju-noir/70 backdrop-blur-sm border border-juju-light-bordure dark:border-juju-bordure items-center justify-center text-juju-light-texte dark:text-juju-texte hover:text-juju-dore transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-center text-sm font-medium uppercase tracking-widest">
            {ANGLE_LABELS[current.angle]}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {orderedResults.map((r, i) => (
          <button
            key={r.angle}
            onClick={() => setIndex(i)}
            aria-label={`Voir ${ANGLE_LABELS[r.angle]}`}
            className={`h-2 rounded-full transition-all ${i === index
              ? 'w-8 bg-juju-dore'
              : 'w-2 bg-juju-bordure hover:bg-juju-texte-mute'
              }`}
          />
        ))}
      </div>

      <div className="hidden md:grid grid-cols-4 gap-3 max-w-md mx-auto">
        {orderedResults.map((r, i) => (
          <button
            key={r.angle}
            onClick={() => setIndex(i)}
            className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${i === index ? 'border-juju-dore' : 'border-juju-light-bordure dark:border-juju-bordure opacity-60 hover:opacity-100'
              }`}
          >
            <img src={r.image_url} alt={ANGLE_LABELS[r.angle]} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Bouton Sauvegarder dans mes essayages */}
      <div className="mt-8 max-w-md mx-auto">
        {!saved ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sauvegarde…
              </>
            ) : (
              <>
                <BookmarkPlus size={18} />
                Sauvegarder dans mes essayages
              </>
            )}
          </button>
        ) : (
          <div className="text-center py-2">
            <p className="inline-flex items-center gap-2 text-sm text-juju-dore font-medium mb-1">
              <Check size={16} /> Sauvegardé dans tes essayages
            </p>
            <div>
              <Link
                to="/essayages"
                className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore transition-colors underline"
              >
                Voir mes essayages →
              </Link>
            </div>
          </div>
        )}
        {saveError && (
          <p className="text-red-400 text-xs text-center mt-2">{saveError}</p>
        )}
      </div>
    </div>
  );
}

function ErrorView({ message, onRetry, articleId }) {
  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
      <h3 className="text-xl font-medium mb-2">Essayage impossible</h3>
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors"
        >
          Réessayer
        </button>
        <Link
          to={`/articles/${articleId}`}
          className="px-6 py-3 border border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte dark:text-juju-texte rounded-lg hover:bg-juju-light-card dark:bg-juju-bleu-clair transition-colors"
        >
          Retour au détail
        </Link>
      </div>
    </div>
  );
}

function PreFlightBlock({ icon: Icon, title, message, ctaLabel, ctaTo, articleId }) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
      <Link
        to={`/articles/${articleId}`}
        className="flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Retour au détail
      </Link>

      <div className="text-center py-16">
        <Icon size={40} className="mx-auto mb-4 text-juju-dore" />
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6 max-w-md mx-auto">{message}</p>
        {ctaLabel && ctaTo && (
          <Link
            to={ctaTo}
            className="inline-flex items-center gap-2 px-6 py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

function CenteredMessage({ children, error }) {
  return (
    <div className={`px-4 py-20 text-center ${error ? 'text-red-400' : 'text-juju-light-texte-mute dark:text-juju-texte-mute'}`}>
      {children}
    </div>
  );
}