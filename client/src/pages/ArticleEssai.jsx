import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ChevronLeft, ChevronRight, AlertCircle, Loader2, RefreshCw, BookmarkPlus, Check } from 'lucide-react';
import { fetchArticle } from '../api/articles';
import { fetchAvatarPhotos } from '../api/avatar';
import { createTryOn, fetchQuota } from '../api/tryon';
import { saveEssayage } from '../api/essayages';
import { Button, Eyebrow } from '../components/ui';

const BACK_LINK =
  'inline-flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-violet dark:hover:text-juju-dore transition-colors mb-6';

const REQUIRED_ANGLES = ['face', 'profil_droit', 'dos', 'profil_gauche'];
const ANGLE_LABELS = {
  face: 'Face',
  profil_droit: 'Profil droit',
  dos: 'De dos',
  profil_gauche: 'Profil gauche',
};

export default function ArticleEssai() {
  const { id } = useParams();

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
    return (
      <CenteredMessage
        spinner
        title="Préparation…"
        message="On vérifie ton mannequin et tes essayages disponibles."
      />
    );
  }

  if (preErr) {
    return (
      <CenteredMessage
        icon={AlertCircle}
        accent="danger"
        title="Oups…"
        message={preErr}
      >
        <Button to="/garde-robe" variant="secondary">
          Retour à ma garde-robe
        </Button>
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
        title="Essayages épuisés"
        message={`Tu as utilisé tes ${quota.limit} essayages gratuits. Une formule pour en profiter davantage arrivera bientôt.`}
        articleId={id}
      />
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-4xl mx-auto">
      <Link to={`/articles/${id}`} className={BACK_LINK}>
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
      <div className="mb-3">
        <Eyebrow>Essayage · Bêta</Eyebrow>
      </div>
      <div className="flex items-center gap-3 mb-2.5">
        <h1 className="font-display text-3xl md:text-4xl leading-[1.08] text-juju-light-texte dark:text-juju-texte">
          Essayage <span className="accent-italic">virtuel</span>
        </h1>
        <span className="px-2 py-0.5 bg-gradient-violet text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-violet-sm">
          Bêta
        </span>
      </div>
      <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-5 max-w-xl">
        Voyons à quoi tu ressembles avec cet article.
      </p>

      <div className="flex items-start gap-2.5 mb-8 rounded-2xl border border-amber-400/30 dark:border-juju-dore/25 bg-amber-50/60 dark:bg-juju-dore/5 px-4 py-3 max-w-xl">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500 dark:text-juju-dore" />
        <p className="text-xs leading-relaxed text-juju-light-texte-mute dark:text-juju-texte-mute">
          Fonctionnalité expérimentale. Le rendu IA peut être approximatif selon les angles et morphologies.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
        <div>
          <p className="text-xs uppercase tracking-wider text-juju-light-texte-mute dark:text-juju-texte-mute mb-2 text-center">
            Article
          </p>
          <div className="aspect-square bg-juju-light-card dark:bg-juju-bleu/40 rounded-2xl overflow-hidden border border-juju-light-bordure dark:border-juju-bordure shadow-card">
            <img src={article.image_url} alt={article.nom} className="w-full h-full object-cover" />
          </div>
          <p className="text-sm font-semibold mt-2 text-center truncate">{article.nom}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-juju-light-texte-mute dark:text-juju-texte-mute mb-2 text-center">
            Sur toi
          </p>
          <div className="aspect-square bg-gradient-to-br from-juju-violet/10 to-juju-dore/10 dark:from-juju-bleu/60 dark:to-juju-noir rounded-2xl overflow-hidden border border-juju-light-bordure dark:border-juju-bordure shadow-card flex items-center justify-center">
            <Sparkles size={36} className="text-juju-violet dark:text-juju-dore" />
          </div>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mt-2 text-center">4 angles · ~25 s</p>
        </div>
      </div>

      <div className="text-center">
        <Button variant="primary" size="lg" icon={Sparkles} onClick={onLaunch}>
          Lancer l'essayage
        </Button>
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-3">
          Il te reste {quota.remaining} essayage{quota.remaining > 1 ? 's' : ''} gratuit{quota.remaining > 1 ? 's' : ''}
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
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-juju-violet border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto text-juju-violet dark:text-juju-dore" size={28} />
      </div>
      <h3 className="font-display text-2xl md:text-3xl mb-2 text-juju-light-texte dark:text-juju-texte">
        Génération en cours…
      </h3>
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
    return <p className="text-red-500 text-center py-10">Aucun résultat exploitable.</p>;
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
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="mb-2">
            <Eyebrow>Essayage · Bêta</Eyebrow>
          </div>
          <h1 className="font-display text-3xl md:text-4xl leading-[1.08] text-juju-light-texte dark:text-juju-texte">
            Essayage <span className="accent-italic">généré</span>
          </h1>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mt-2">Fais défiler pour tourner autour</p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={onRetry} className="shrink-0">
          Refaire
        </Button>
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
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-juju-light-card/80 dark:bg-juju-noir/70 backdrop-blur border border-juju-light-bordure dark:border-juju-bordure items-center justify-center text-juju-light-texte dark:text-juju-texte hover:text-juju-violet dark:hover:text-juju-dore hover:border-juju-violet dark:hover:border-juju-dore transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          aria-label="Angle suivant"
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-juju-light-card/80 dark:bg-juju-noir/70 backdrop-blur border border-juju-light-bordure dark:border-juju-bordure items-center justify-center text-juju-light-texte dark:text-juju-texte hover:text-juju-violet dark:hover:text-juju-dore hover:border-juju-violet dark:hover:border-juju-dore transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-white">
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
              ? 'w-8 bg-gradient-violet'
              : 'w-2 bg-juju-light-bordure dark:bg-juju-bordure hover:bg-juju-light-texte-mute dark:hover:bg-juju-texte-mute'
              }`}
          />
        ))}
      </div>

      <div className="hidden md:grid grid-cols-4 gap-3 max-w-md mx-auto">
        {orderedResults.map((r, i) => (
          <button
            key={r.angle}
            onClick={() => setIndex(i)}
            className={`aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${i === index ? 'border-juju-violet' : 'border-juju-light-bordure dark:border-juju-bordure opacity-60 hover:opacity-100'
              }`}
          >
            <img src={r.image_url} alt={ANGLE_LABELS[r.angle]} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Bouton Sauvegarder dans mes essayages */}
      <div className="mt-8 max-w-md mx-auto">
        {!saved ? (
          <Button
            variant="primary"
            fullWidth
            icon={BookmarkPlus}
            loading={saving}
            onClick={handleSave}
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder dans mes essayages'}
          </Button>
        ) : (
          <div className="text-center py-2">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-juju-violet dark:text-juju-dore mb-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-juju-violet/10 dark:bg-juju-dore/10 text-juju-violet dark:text-juju-dore">
                <Check size={13} />
              </span>
              Sauvegardé dans tes essayages
            </p>
            <div>
              <Link
                to="/essayages"
                className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-violet dark:hover:text-juju-dore transition-colors underline"
              >
                Voir mes essayages →
              </Link>
            </div>
          </div>
        )}
        {saveError && (
          <p className="text-red-500 text-xs text-center mt-2">{saveError}</p>
        )}
      </div>
    </div>
  );
}

function ErrorView({ message, onRetry, articleId }) {
  return (
    <div className="text-center py-16 max-w-md mx-auto animate-fade-up">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 ring-1 ring-red-500/20">
        <AlertCircle size={28} />
      </div>
      <h3 className="font-display text-2xl mb-2 text-juju-light-texte dark:text-juju-texte">
        Essayage impossible
      </h3>
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="primary" icon={RefreshCw} onClick={onRetry}>
          Réessayer
        </Button>
        <Button variant="secondary" to={`/articles/${articleId}`}>
          Retour au détail
        </Button>
      </div>
    </div>
  );
}

function PreFlightBlock({ icon: Icon, title, message, ctaLabel, ctaTo, articleId }) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
      <Link to={`/articles/${articleId}`} className={BACK_LINK}>
        <ArrowLeft size={16} />
        Retour au détail
      </Link>

      <div className="text-center py-16 max-w-sm mx-auto animate-fade-up">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-juju-violet/10 dark:bg-juju-dore/10 flex items-center justify-center text-juju-violet dark:text-juju-dore ring-1 ring-juju-violet/20 dark:ring-juju-dore/20">
          <Icon size={28} />
        </div>
        <h3 className="font-display text-2xl mb-2 text-juju-light-texte dark:text-juju-texte">{title}</h3>
        <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">{message}</p>
        {ctaLabel && ctaTo && (
          <Button variant="primary" to={ctaTo}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

function CenteredMessage({ spinner, icon: Icon, accent, title, message, children }) {
  const isDanger = accent === 'danger';
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
      <div className="text-center py-16 max-w-sm mx-auto animate-fade-up">
        {spinner ? (
          <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center">
            <Loader2 size={36} className="animate-spin text-juju-violet dark:text-juju-dore" />
          </div>
        ) : (
          Icon && (
            <div
              className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center ring-1 ${
                isDanger
                  ? 'bg-red-500/10 text-red-500 ring-red-500/20'
                  : 'bg-juju-violet/10 dark:bg-juju-dore/10 text-juju-violet dark:text-juju-dore ring-juju-violet/20 dark:ring-juju-dore/20'
              }`}
            >
              <Icon size={28} />
            </div>
          )
        )}
        {title && (
          <h3 className="font-display text-2xl mb-2 text-juju-light-texte dark:text-juju-texte">{title}</h3>
        )}
        {message && (
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">{message}</p>
        )}
        {children}
      </div>
    </div>
  );
}