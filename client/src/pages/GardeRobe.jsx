import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Shirt, Filter, Camera, Heart } from 'lucide-react';
import { fetchArticles, toggleFavori } from '../api/articles';
import { useReferentiels } from '../hooks/useReferentiels';
import { Button, Card, PageHeader, SectionLabel } from '../components/ui';

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
    favori: searchParams.get('favori') || '',
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

  const handleToggleFavori = async (id_article) => {
    // Mise à jour optimiste
    setArticles((prev) =>
      prev.map((a) => (a.id_article === id_article ? { ...a, favori: !a.favori } : a))
    );
    try {
      await toggleFavori(id_article);
    } catch {
      // Rollback en cas d'échec
      setArticles((prev) =>
        prev.map((a) => (a.id_article === id_article ? { ...a, favori: !a.favori } : a))
      );
    }
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const totalActive = activeFiltersCount + (filters.search ? 1 : 0);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Ta garde-robe"
        title="Ma garde-robe"
        subtitle={
          !loading && !error
            ? `${articles.length} article${articles.length > 1 ? 's' : ''} numérisé${articles.length > 1 ? 's' : ''}`
            : undefined
        }
        actions={
          <Button
            variant="secondary"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => setFiltersOpen(true)}
            className="relative"
          >
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-violet text-white text-[10px] font-bold flex items-center justify-center shadow-violet-sm">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        }
        className="mb-5"
      />

      {totalActive > 0 && !loading && !error && (
        <button
          onClick={resetFilters}
          className="text-sm text-juju-violet dark:text-juju-dore hover:underline mb-4 -mt-3 inline-block"
        >
          Réinitialiser les filtres
        </button>
      )}

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-juju-light-texte-mute dark:text-juju-texte-mute pointer-events-none"
        >
          {/* Note: In lucide-react, icons don't typically take children, self-closing is fine */}
        </Search>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher un article…"
          className="field-input pl-11"
        />
      </div>

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
          {articles.map((article, i) => (
            <ArticleCard key={article.id_article} article={article} index={i} onToggleFavori={handleToggleFavori} />
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
        className="fixed inset-0 bg-juju-noir/50 backdrop-blur-sm z-30 animate-fade-up"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-xl md:w-full md:rounded-2xl rounded-t-3xl bg-juju-light-bg dark:bg-juju-bleu border-t md:border border-juju-light-bordure dark:border-juju-bordure z-40 max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-juju-light-bordure dark:border-juju-bordure">
          <h3 className="font-display text-xl">Filtres</h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-violet dark:hover:text-juju-dore hover:bg-juju-light-bordure/50 dark:hover:bg-juju-bordure/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
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

          <FilterSection title="Favoris">
            <ChipGroup
              options={[{ value: 'true', label: '❤️ Favoris uniquement' }]}
              value={filters.favori}
              onChange={(v) => onUpdate('favori', v)}
            />
          </FilterSection>

          {referentiels?.marques?.length > 0 && (
            <FilterSection title="Marque">
              <select
                value={filters.id_marque}
                onChange={(e) => onUpdate('id_marque', e.target.value)}
                className="field-input appearance-none cursor-pointer"
              >
                <option value="">Toutes les marques</option>
                {referentiels.marques.map((m) => (
                  <option key={m.id_marque} value={m.id_marque}>{m.nom_marque || m.nom}</option>
                ))}
              </select>
            </FilterSection>
          )}

          {referentiels?.couleurs?.length > 0 && (
            <FilterSection title="Couleur">
              <div className="flex flex-wrap gap-2.5">
                {referentiels.couleurs.map((c) => {
                  const isActive = filters.id_couleur === String(c.id_couleur);
                  return (
                    <button
                      key={c.id_couleur}
                      onClick={() => onUpdate('id_couleur', isActive ? '' : String(c.id_couleur))}
                      title={c.nom}
                      className={`w-10 h-10 rounded-full transition-all ${
                        isActive
                          ? 'ring-2 ring-offset-2 ring-juju-violet ring-offset-juju-light-bg dark:ring-offset-juju-bleu scale-110'
                          : 'ring-1 ring-juju-light-bordure dark:ring-juju-bordure hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.code_hex || '#888' }}
                    />
                  );
                })}
              </div>
            </FilterSection>
          )}

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
            <Button variant="danger-soft" size="md" fullWidth onClick={onReset}>
              Réinitialiser
            </Button>
          )}
          <Button size="md" fullWidth onClick={onClose}>
            Voir {activeCount > 0 ? 'les résultats' : 'tout'}
          </Button>
        </div>
      </div>
    </>
  );
}

function FilterSection({ title, children }) {
  return (
    <div>
      <SectionLabel className="mb-2.5">{title}</SectionLabel>
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
            className={`px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-violet text-white border-transparent shadow-violet-sm'
                : 'border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte dark:text-juju-texte hover:border-juju-violet hover:text-juju-violet dark:hover:text-white'
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
function ArticleCard({ article, index = 0, onToggleFavori }) {
  const prix = article.prix ? `${parseFloat(article.prix).toFixed(2).replace('.', ',')} €` : null;
  const subtitle = [article.marque, article.categorie].filter(Boolean).join(' · ');

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavori?.(article.id_article);
  };

  return (
    <Card
      hover
      accent="violet"
      to={`/articles/${article.id_article}`}
      className="overflow-hidden group animate-fade-up opacity-0"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-juju-light-bg to-juju-light-bordure/50 dark:from-juju-bleu/60 dark:to-juju-noir">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.nom}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

        {/* Bouton favori */}
        <button
          onClick={handleHeartClick}
          aria-label={article.favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-juju-light-card/85 dark:bg-juju-noir/70 backdrop-blur flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <Heart
            size={16}
            className={`transition-colors ${
              article.favori
                ? 'fill-red-500 text-red-500'
                : 'text-juju-light-texte-mute dark:text-juju-texte-mute'
            }`}
          />
        </button>

        {prix && (
          <span className="absolute top-2.5 right-2.5 text-[11px] font-bold px-2 py-1 rounded-full bg-juju-light-card/85 dark:bg-juju-noir/70 backdrop-blur text-juju-dore border border-juju-dore/25">
            {prix}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm leading-tight truncate">{article.nom}</p>
        {subtitle && (
          <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-juju-light-bordure dark:border-juju-bordure overflow-hidden">
          <div className="aspect-square skeleton bg-juju-light-card dark:bg-juju-bleu/60" />
          <div className="p-3 space-y-2">
            <div className="h-3 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded w-3/4" />
            <div className="h-2.5 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StateWrapper({ icon: Icon, title, children }) {
  return (
    <div className="text-center py-20 max-w-sm mx-auto animate-fade-up">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-juju-violet/10 dark:bg-juju-dore/10 flex items-center justify-center text-juju-violet dark:text-juju-dore ring-1 ring-juju-violet/20 dark:ring-juju-dore/20">
        <Icon size={28} />
      </div>
      <h3 className="font-display text-xl mb-2">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <StateWrapper icon={Shirt} title="Ta garde-robe est vide">
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">
        Numérise ton premier article : prends-le en photo, l'IA s'occupe du reste.
      </p>
      <Button to="/ajout" icon={Camera}>Ajouter un article</Button>
    </StateWrapper>
  );
}

function NoMatchState({ onReset }) {
  return (
    <StateWrapper icon={Filter} title="Aucun résultat">
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">
        Aucun article ne correspond à tes filtres.
      </p>
      <Button variant="secondary" onClick={onReset}>Réinitialiser</Button>
    </StateWrapper>
  );
}

function ErrorState({ message }) {
  return (
    <div className="text-center py-20">
      <p className="text-red-500 mb-2 font-medium">{message}</p>
      <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute">
        Vérifie que le serveur backend tourne sur le port 3001.
      </p>
    </div>
  );
}