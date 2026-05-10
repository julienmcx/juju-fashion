import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ArticleEdit() {
  const { id } = useParams();
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
      <Link
        to={`/articles/${id}`}
        className="flex items-center gap-2 text-sm text-juju-texte-mute hover:text-juju-dore transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Retour au détail
      </Link>
      <h2 className="text-2xl md:text-3xl font-medium mb-2">Modifier l'article</h2>
      <p className="text-juju-texte-mute">Le formulaire d'édition arrive plus tard.</p>
    </div>
  );
}