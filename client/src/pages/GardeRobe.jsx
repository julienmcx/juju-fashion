import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Shirt, Filter } from 'lucide-react';
import { fetchArticles } from '../api/articles';
import { useReferentiels } from '../hooks/useReferentiels';

const ORIGINES = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'fripe', label: 'Fripe' },
  { value: 'seconde_main', label: 'Seconde main' },
  { value: 'cadeau', label: 'Cadeau' },
  { value: 'fait_main', label: 'Fait main' },
  { value: 'autre', label: 'Autre' },
];

export default function GardeRobe() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: referentiels } = useReferentiels();

  // Source de vérité : query params
  const filters = {
    search: searchParams.get('search') || '',
    id_categorie: searchParams.get('id_categorie') || '',
    id_marque: searchParams.get('id_marque') || '',
    id_couleur: searchParams.get('id_couleur') || '',
    origine: searchParams.get('origine') || '',
  };

  const activeFiltersCount = Object.entries(filters)
    .filter(([k, v]) => k !== 'search' && v)
    .length;

  // Debounce search local pour ne pas spammer l'API à chaque touche
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilter('search', searchInput);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Charge les articles à chaque changement de filtres (= searchParams)
  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    fetchArticles(params)
      .then((data) => {
        setArticles(data.articles);
        setError('');
      })
      .catch(() => setError('Impossible de charger ta garde-robe'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const totalActive = activeFiltersCount + (filters.search ? 1 : 0);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-6xl mx-auto pb-24 md:pb-10">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium">Ma garde-robe</h2>
            {!loading && !error && (
              <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mt-1">
                {articles.length} article{articles.length > 1 ? 's' : ''}
                {totalActive > 0 && (
                  <button
                    onClick={resetFilters}
                    className="ml-2 text-juju-dore hover:underline"
                  >
                    · Réinitialiser
                  </button>
                )}
              </p>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label="Filtres"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg border border-juju-light-bordure dark:border-juju-bordure hover:border-juju-dore hover:text-juju-dore transition-colors text-sm"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-juju-dore text-juju-noir text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-juju-light-texte-mute dark:text-juju-texte-mute pointer-events-none"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-juju-light-card dark:bg-juju-bleu/40 border border-juju-light-bordure dark:border-juju-bordure focus:border-juju-dore focus:outline-none text-sm"
          />
        </div>
      </header>

      {filtersOpen && (
        <FiltersPanel
          filters={filters}
          referentiels={referentiels}
          onUpdate={updateFilter}
          onReset={resetFilters}
          onClose={() => setFiltersOpen(false)}
          activeCount={activeFiltersCount}
        />
      )}

      {loading && <SkeletonGrid />}
      {error && <ErrorState message={error} />}
      {!loading && !error && articles.length === 0 && (
        totalActive > 0 ? <NoMatchState onReset={resetFilters} /> : <EmptyState />
      )}
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

/* ============================================================
   PANEL DE FILTRES
   ============================================================ */
function FiltersPanel({ filters, referentiels, onUpdate, onReset, onClose, activeCount }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-xl md:w-full md:rounded-xl rounded-t-2xl bg-juju-light-bg dark:bg-juju-bleu border-t md:border border-juju-light-bordure dark:border-juju-bordure z-40 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-juju-light-bordure dark:border-juju-bordure">
          <h3 className="text-lg font-medium">Filtres</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 rounded hover:text-juju-dore transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Catégorie */}
          {referentiels?.categories?.length > 0 && (
            <FilterSection title="Catégorie">
              <ChipGroup
                options={referentiels.categories.map((c) => ({
                  value: String(c.id_categorie),
                  label: c.nom,
                }))}
                value={filters.id_categorie}
                onChange={(v) => onUpdate('id_categorie', v)}
              />
            </FilterSection>
          )}

          {/* Marque */}
          {referentiels?.marques?.length > 0 && (
            <FilterSection title="Marque">
              <select
                value={filters.id_marque}
                onChange={(e) => onUpdate('id_marque', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-juju-light-card dark:bg-juju-bleu-clair border border-juju-light-bordure dark:border-juju-bordure focus:border-juju-dore focus:outline-none text-sm"
              >
                <option value="">Toutes les marques</option>
                {referentiels.marques.map((m) => (
                  <option key={m.id_marque} value={m.id_marque}>{m.nom_marque || m.nom}</option>
                ))}
              </select>
            </FilterSection>
          )}

          {/* Couleur */}
          {referentiels?.couleurs?.length > 0 && (
            <FilterSection title="Couleur">
              <div className="flex flex-wrap gap-2">
                {referentiels.couleurs.map((c) => {
                  const isActive = filters.id_couleur === String(c.id_couleur);
                  return (
                    <button
                      key={c.id_couleur}
                      onClick={() => onUpdate('id_couleur', isActive ? '' : String(c.id_couleur))}
                      title={c.nom}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        isActive
                          ? 'border-juju-dore scale-110'
                          : 'border-juju-light-bordure dark:border-juju-bordure hover:border-juju-light-texte-mute dark:hover:border-juju-texte-mute'
                      }`}
                      style={{ backgroundColor: c.code_hex || '#888' }}
                    />
                  );
                })}
              </div>
            </FilterSection>
          )}

          {/* Origine */}
          <FilterSection title="Origine">
            <ChipGroup
              options={ORIGINES}
              value={filters.origine}
              onChange={(v) => onUpdate('origine', v)}
            />
          </FilterSection>
        </div>

        <div className="px-5 py-4 border-t border-juju-light-bordure dark:border-juju-bordure flex gap-3">
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2.5 border border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte-mute dark:text-juju-texte-mute rounded-lg hover:border-red-400 hover:text-red-400 transition-colors text-sm"
            >
              Réinitialiser
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors text-sm"
          >
            Voir {activeCount > 0 ? 'les résultats' : 'tout'}
          </button>
        </div>
      </div>
    </>
  );
}

function FilterSection({ title, children }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-widest text-juju-light-texte-mute dark:text-juju-texte-mute mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(isActive ? '' : opt.value)}
            className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
              isActive
                ? 'bg-juju-dore text-juju-noir border-juju-dore'
                : 'border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte dark:text-juju-texte hover:border-juju-dore'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   CARTES + ÉTATS
   ============================================================ */
function ArticleCard({ article }) {
  const prix = article.prix ? `${parseFloat(article.prix).toFixed(2).replace('.', ',')} €` : null;
  const subtitle = [article.marque, article.categorie, prix].filter(Boolean).join(' · ');

  return (
    <Link to={`/articles/${article.id_article}`} className="group block">
      <div className="aspect-square bg-juju-light-card dark:bg-juju-bleu rounded-lg overflow-hidden border border-juju-light-bordure dark:border-juju-bordure group-hover:border-juju-dore transition-colors">
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
          <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-0.5 truncate">
            {subtitle}
          </p>
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
          <div className="aspect-square bg-juju-light-card dark:bg-juju-bleu/60 rounded-lg animate-pulse" />
          <div className="mt-2 space-y-2">
            <div className="h-3 bg-juju-light-card dark:bg-juju-bleu/60 rounded w-3/4 animate-pulse" />
            <div className="h-2.5 bg-juju-light-card dark:bg-juju-bleu/60 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 max-w-sm mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure flex items-center justify-center">
        <Shirt size={28} className="text-juju-dore" />
      </div>
      <h3 className="text-lg font-medium mb-2">Ta garde-robe est vide</h3>
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute">
        Numérise ton premier article depuis l'app mobile pour démarrer.
      </p>
    </div>
  );
}

function NoMatchState({ onReset }) {
  return (
    <div className="text-center py-20 max-w-sm mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure flex items-center justify-center">
        <Filter size={28} className="text-juju-dore" />
      </div>
      <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-4">
        Aucun article ne correspond à tes filtres.
      </p>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors text-sm"
      >
        Réinitialiser
      </button>
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