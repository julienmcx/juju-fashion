import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Shirt } from 'lucide-react';
import { fetchArticles } from '../api/articles';

export default function GardeRobe() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles()
      .then((data) => setArticles(data.articles))
      .catch(() => setError('Impossible de charger ta garde-robe'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-medium">Ma garde-robe</h2>
          {!loading && !error && (
            <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mt-1">
              {articles.length} article{articles.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Rechercher"
            className="p-2.5 rounded-lg border border-juju-light-bordure dark:border-juju-bordure hover:border-juju-dore hover:text-juju-dore transition-colors"
          >
            <Search size={18} />
          </button>
          <button
            aria-label="Filtres"
            className="p-2.5 rounded-lg border border-juju-light-bordure dark:border-juju-bordure hover:border-juju-dore hover:text-juju-dore transition-colors"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </header>

      {loading && <SkeletonGrid />}
      {error && <ErrorState message={error} />}
      {!loading && !error && articles.length === 0 && <EmptyState />}
      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id_article} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }) {
  const prix = article.prix ? `${parseFloat(article.prix).toFixed(2).replace('.', ',')} €` : null;
  const subtitle = [article.marque, article.categorie, prix].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/articles/${article.id_article}`}
      className="group block"
    >
      <div className="aspect-square bg-juju-bleu rounded-lg overflow-hidden border border-juju-light-bordure dark:border-juju-bordure group-hover:border-juju-dore transition-colors">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.nom}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-juju-light-texte-mute dark:text-juju-texte-mute"
          style={{ display: article.image_url ? 'none' : 'flex' }}
        >
          <Shirt size={32} />
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <p className="font-medium text-sm leading-tight truncate">{article.nom}</p>
        {subtitle && (
          <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i}>
          <div className="aspect-square bg-juju-bleu/60 rounded-lg animate-pulse" />
          <div className="mt-2 space-y-2">
            <div className="h-3 bg-juju-bleu/60 rounded w-3/4 animate-pulse" />
            <div className="h-2.5 bg-juju-bleu/60 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 max-w-sm mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure flex items-center justify-center">
        <Shirt size={28} className="text-juju-dore" />
      </div>
      <h3 className="text-lg font-medium mb-2">Ta garde-robe est vide</h3>
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute">
        Numérise ton premier article depuis l'app mobile pour démarrer.
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="text-center py-20">
      <p className="text-red-400 mb-2">{message}</p>
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute">
        Vérifie que le serveur backend tourne sur le port 3001.
      </p>
    </div>
  );
}