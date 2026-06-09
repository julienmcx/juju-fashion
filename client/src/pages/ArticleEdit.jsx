import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchArticle, updateArticle } from '../api/articles';
import {
  fetchCategories, fetchCouleurs, fetchMatieres, fetchMarques,
} from '../api/referentiels';
import ArticleForm from '../components/ArticleForm';
import { Button } from '../components/ui';

export default function ArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [marques, setMarques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [couleurs, setCouleurs] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetchArticle(id),
      fetchCategories(),
      fetchCouleurs(),
      fetchMatieres(),
      fetchMarques(),
    ])
      .then(([articleData, cats, cols, mats, mqs]) => {
        setArticle(articleData.article);
        setCategories(cats);
        setCouleurs(cols);
        setMatieres(mats);
        setMarques(mqs);
      })
      .catch((err) => {
        setError(err.response?.status === 404 ? 'not-found' : 'load-error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (payload) => {
    await updateArticle(id, payload);
    navigate(`/articles/${id}`);
  };

  if (loading) return <Loading />;
  if (error === 'not-found') return <NotFound />;
  if (error) return <ErrorBox />;

  const initialValues = {
    ...article,
    couleurs_ids: article.couleurs?.map((c) => c.id_couleur) || [],
    matieres_with_pct:
      article.matieres?.map((m) => ({
        id_matiere: m.id_matiere,
        pourcentage: m.pourcentage,
      })) || [],
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
      <Link
        to={`/articles/${id}`}
        className="inline-flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-violet dark:hover:text-juju-dore transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Retour au détail
      </Link>

      <h1 className="font-display text-3xl md:text-4xl mb-8">
        Modifier l'<span className="accent-italic">article</span>
      </h1>

      <ArticleForm
        initialValues={initialValues}
        referentiels={{ categories, couleurs, matieres, marques }}
        setMarques={setMarques}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer"
        onCancel={() => navigate(`/articles/${id}`)}
      />
    </div>
  );
}

function Loading() {
  return (
    <div className="px-4 py-24 flex flex-col items-center justify-center gap-3 text-juju-light-texte-mute dark:text-juju-texte-mute">
      <Loader2 size={26} className="animate-spin text-juju-violet dark:text-juju-dore" />
      Chargement…
    </div>
  );
}

function NotFound() {
  return (
    <div className="px-4 py-20 text-center max-w-md mx-auto animate-fade-up">
      <h2 className="font-display text-xl mb-3">Article introuvable</h2>
      <Button to="/garde-robe" variant="primary" icon={ArrowLeft}>
        Retour à ma garde-robe
      </Button>
    </div>
  );
}

function ErrorBox() {
  return (
    <div className="px-4 py-20 text-center max-w-md mx-auto animate-fade-up">
      <p className="text-red-500 mb-4 font-medium">Erreur de chargement.</p>
      <Button to="/garde-robe" variant="primary" icon={ArrowLeft}>
        Retour à ma garde-robe
      </Button>
    </div>
  );
}
