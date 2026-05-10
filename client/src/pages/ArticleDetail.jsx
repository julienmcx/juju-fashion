import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Sparkles, Shirt, ExternalLink } from 'lucide-react';
import { fetchArticle, deleteArticle } from '../api/articles';
import ConfirmDialog from '../components/ConfirmDialog';

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
        className="flex items-center gap-2 text-sm text-juju-texte-mute hover:text-juju-dore transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Retour à la garde-robe
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-juju-bleu rounded-2xl overflow-hidden border border-juju-bordure">
          {article.image_url ? (
            <img src={article.image_url} alt={article.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Shirt size={64} className="text-juju-texte-mute" />
            </div>
          )}
        </div>

        <div>
          {article.categorie_nom && (
            <p className="text-xs text-juju-texte-mute uppercase tracking-widest mb-2">
              {article.categorie_nom}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-medium mb-2 leading-tight">{article.nom}</h1>
          {article.marque_nom && (
            <p className="text-juju-texte-mute mb-4">par {article.marque_nom}</p>
          )}
          {prix && <p className="text-2xl text-juju-dore mb-6">{prix}</p>}

          {article.couleurs?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-juju-texte-mute uppercase tracking-wider mb-2">Couleurs</p>
              <div className="flex flex-wrap gap-2">
                {article.couleurs.map((c) => (
                  <div
                    key={c.id_couleur}
                    className="flex items-center gap-2 px-3 py-1.5 bg-juju-bleu border border-juju-bordure rounded-full"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-juju-bordure"
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
              <p className="text-xs text-juju-texte-mute uppercase tracking-wider mb-2">Composition</p>
              <div className="flex flex-wrap gap-2">
                {article.matieres.map((m) => (
                  <span
                    key={m.id_matiere}
                    className="text-xs px-3 py-1.5 bg-juju-bleu border border-juju-bordure rounded-full"
                  >
                    {m.nom}
                    {m.pourcentage ? ` · ${m.pourcentage}%` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm mb-5 pt-3 border-t border-juju-bordure/50">
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
            <div className="mb-5 p-4 bg-juju-bleu/50 border border-juju-bordure rounded-lg">
              <p className="text-xs text-juju-texte-mute uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm whitespace-pre-line">{article.notes}</p>
            </div>
          )}

          {article.lien_achat && (
            <a
              href={article.lien_achat}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-juju-dore hover:underline mb-6"
            >
              Voir la fiche d'achat <ExternalLink size={14} />
            </a>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-juju-bordure">
            <button
              onClick={() => alert('Essayage virtuel : à venir')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors"
            >
              <Sparkles size={18} />
              Essayer
            </button>
            <Link
              to={`/articles/${id}/edit`}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-juju-bordure text-juju-texte rounded-lg hover:border-juju-dore hover:text-juju-dore transition-colors"
            >
              <Edit size={18} />
              Modifier
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-juju-bordure text-juju-texte-mute rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
              Supprimer
            </button>
          </div>

          {error === 'delete-error' && (
            <p className="text-red-400 text-sm mt-3">Suppression impossible. Réessaie.</p>
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
      <span className="text-juju-texte-mute">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 animate-pulse">
        <div className="aspect-square bg-juju-bleu/60 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-3 bg-juju-bleu/60 rounded w-1/4" />
          <div className="h-8 bg-juju-bleu/60 rounded w-3/4" />
          <div className="h-4 bg-juju-bleu/60 rounded w-1/2" />
          <div className="h-6 bg-juju-bleu/60 rounded w-1/3 mt-4" />
          <div className="h-20 bg-juju-bleu/60 rounded mt-4" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="px-4 py-20 text-center max-w-md mx-auto">
      <Shirt size={48} className="mx-auto mb-4 text-juju-texte-mute" />
      <h2 className="text-xl font-medium mb-2">Article introuvable</h2>
      <p className="text-juju-texte-mute mb-6">
        Cet article n'existe pas ou ne fait pas partie de ta garde-robe.
      </p>
      <Link to="/garde-robe" className="text-juju-dore hover:underline">
        Retour à ma garde-robe
      </Link>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="px-4 py-20 text-center">
      <p className="text-red-400 mb-4">{message}</p>
      <Link to="/garde-robe" className="text-juju-dore hover:underline">
        Retour à ma garde-robe
      </Link>
    </div>
  );
}