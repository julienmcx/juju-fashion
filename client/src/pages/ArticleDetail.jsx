import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Sparkles, Shirt, ExternalLink, Heart } from 'lucide-react';
import { fetchArticle, deleteArticle, toggleFavori } from '../api/articles';
import ConfirmDialog from '../components/ConfirmDialog';
import { Button, Card, Eyebrow, SectionLabel } from '../components/ui';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchArticle(id)
      .then((data) => setArticle(data.article))
      .catch((err) => {
        setError(err.response?.status === 404 ? 'not-found' : 'load-error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFavori = async () => {
    setArticle((prev) => ({ ...prev, favori: !prev.favori }));
    try {
      await toggleFavori(id);
    } catch {
      setArticle((prev) => ({ ...prev, favori: !prev.favori }));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteArticle(id);
      navigate('/garde-robe');
    } catch {
      setError('delete-error');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (error === 'not-found') return <NotFound />;
  if (error === 'load-error') return <ErrorBox message="Impossible de charger l'article." />;

  const prix = article.prix
    ? `${parseFloat(article.prix).toFixed(2).replace('.', ',')} ${article.devise || 'EUR'}`
    : null;

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/garde-robe')}
        className="inline-flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-violet dark:hover:text-juju-dore transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Retour à la garde-robe
      </button>

      <div className="grid md:grid-cols-2 gap-8 animate-fade-up">
        <Card className="aspect-square overflow-hidden shadow-card">
          {article.image_url ? (
            <img src={article.image_url} alt={article.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-juju-light-bg to-juju-light-bordure/50 dark:from-juju-bleu/60 dark:to-juju-noir text-juju-light-texte-mute dark:text-juju-texte-mute">
              <Shirt size={64} />
            </div>
          )}
        </Card>

        <div>
          {article.categorie_nom && (
            <Eyebrow className="mb-3">{article.categorie_nom}</Eyebrow>
          )}
          <div className="flex items-start gap-3 mb-2">
            <h1 className="font-display text-3xl md:text-4xl leading-[1.08] flex-1">{article.nom}</h1>
            <button
              onClick={handleToggleFavori}
              aria-label={article.favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className="shrink-0 w-11 h-11 rounded-full border border-juju-light-bordure dark:border-juju-bordure flex items-center justify-center transition-all hover:scale-105 active:scale-95 mt-1"
            >
              <Heart
                size={20}
                className={`transition-colors ${
                  article.favori ? 'fill-red-500 text-red-500' : 'text-juju-light-texte-mute dark:text-juju-texte-mute'
                }`}
              />
            </button>
          </div>          {article.marque_nom && (
            <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-4">par {article.marque_nom}</p>
          )}
          {prix && <p className="text-2xl font-display text-juju-dore mb-6">{prix}</p>}

          {article.couleurs?.length > 0 && (
            <div className="mb-5">
              <SectionLabel className="mb-2.5">Couleurs</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {article.couleurs.map((c) => (
                  <div
                    key={c.id_couleur}
                    className="flex items-center gap-2 px-3 py-1.5 bg-juju-light-card dark:bg-juju-bleu/40 border border-juju-light-bordure dark:border-juju-bordure rounded-full"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-juju-light-bordure dark:border-juju-bordure"
                      style={{ backgroundColor: c.code_hex }}
                    />
                    <span className="text-xs">{c.nom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {article.matieres?.length > 0 && (
            <div className="mb-5">
              <SectionLabel className="mb-2.5">Composition</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {article.matieres.map((m) => (
                  <span
                    key={m.id_matiere}
                    className="text-xs px-3 py-1.5 bg-juju-light-card dark:bg-juju-bleu/40 border border-juju-light-bordure dark:border-juju-bordure rounded-full"
                  >
                    {m.nom}
                    {m.pourcentage ? ` · ${m.pourcentage}%` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm mb-5 pt-4 border-t border-juju-light-bordure dark:border-juju-bordure/50">
            {article.origine && <Field label="Origine" value={capitalize(article.origine)} />}
            {article.taille && <Field label="Taille" value={article.taille} />}
            {article.pointure && <Field label="Pointure" value={article.pointure} />}
            {article.longueur_cm && <Field label="Longueur" value={`${article.longueur_cm} cm`} />}
            {article.matiere_bijou && <Field label="Matière" value={article.matiere_bijou} />}
            {article.lunettes_teintees !== null && article.lunettes_teintees !== undefined && (
              <Field label="Verres teintés" value={article.lunettes_teintees ? 'Oui' : 'Non'} />
            )}
          </div>

          {article.notes && (
            <Card className="p-4 mb-5">
              <SectionLabel className="mb-1.5">Notes</SectionLabel>
              <p className="text-sm whitespace-pre-line">{article.notes}</p>
            </Card>
          )}

          {article.lien_achat && (
            <a
              href={article.lien_achat}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-juju-violet dark:text-juju-dore hover:underline mb-6"
            >
              Voir la fiche d'achat <ExternalLink size={14} />
            </a>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-juju-light-bordure dark:border-juju-bordure">
            <Button to={`/articles/${id}/essai`} variant="primary" icon={Sparkles} className="relative">
              Essayer
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-juju-violet text-white text-[9px] font-bold uppercase tracking-wider rounded-full border-2 border-juju-light-bg dark:border-juju-noir">
                Bêta
              </span>
            </Button>
            <Button to={`/articles/${id}/edit`} variant="secondary" icon={Edit}>
              Modifier
            </Button>
            <Button variant="danger-soft" icon={Trash2} onClick={() => setShowDeleteConfirm(true)}>
              Supprimer
            </Button>
          </div>

          {error === 'delete-error' && (
            <p className="text-red-500 text-sm mt-3">Suppression impossible. Réessaie.</p>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Supprimer cet article ?"
          message={`"${article.nom}" sera retiré définitivement de ta garde-robe. Cette action est irréversible.`}
          confirmText="Supprimer"
          confirmVariant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}

function Field({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-juju-light-texte-mute dark:text-juju-texte-mute">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square skeleton bg-juju-light-card dark:bg-juju-bleu/60 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-3 w-1/4 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded" />
          <div className="h-8 w-3/4 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded" />
          <div className="h-4 w-1/2 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded" />
          <div className="h-6 w-1/3 mt-4 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded" />
          <div className="h-20 mt-4 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="px-4 py-20 text-center max-w-md mx-auto animate-fade-up">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-juju-violet/10 dark:bg-juju-dore/10 flex items-center justify-center text-juju-violet dark:text-juju-dore ring-1 ring-juju-violet/20 dark:ring-juju-dore/20">
        <Shirt size={28} />
      </div>
      <h2 className="font-display text-xl mb-2">Article introuvable</h2>
      <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">
        Cet article n'existe pas ou ne fait pas partie de ta garde-robe.
      </p>
      <Button to="/garde-robe" variant="primary" icon={ArrowLeft}>
        Retour à ma garde-robe
      </Button>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="px-4 py-20 text-center max-w-md mx-auto animate-fade-up">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-juju-violet/10 dark:bg-juju-dore/10 flex items-center justify-center text-juju-violet dark:text-juju-dore ring-1 ring-juju-violet/20 dark:ring-juju-dore/20">
        <Shirt size={28} />
      </div>
      <h2 className="font-display text-xl mb-2">Une erreur est survenue</h2>
      <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">{message}</p>
      <Button to="/garde-robe" variant="primary" icon={ArrowLeft}>
        Retour à ma garde-robe
      </Button>
    </div>
  );
}
