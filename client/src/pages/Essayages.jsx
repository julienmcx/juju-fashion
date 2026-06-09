import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shirt, Loader2 } from 'lucide-react';
import { fetchEssayages } from '../api/essayages';

export default function Essayages() {
    const [essayages, setEssayages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        fetchEssayages()
            .then((data) => {
                if (mounted) setEssayages(data.essayages);
            })
            .catch((err) => {
                if (mounted) setError(err.response?.data?.error || 'Erreur de chargement');
            })
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-medium mb-6">Mes essayages</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-juju-light-card dark:bg-juju-bleu/30 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-medium mb-6">Mes essayages</h1>
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        );
    }

    if (!essayages || essayages.length === 0) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-medium mb-2">Mes essayages</h1>
                <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-10">
                    Retrouve ici les essayages virtuels que tu as choisi de garder.
                </p>

                <div className="flex flex-col items-center text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-juju-light-card dark:bg-juju-bleu/30 flex items-center justify-center mb-5">
                        <Sparkles size={32} className="text-juju-dore" />
                    </div>
                    <h2 className="text-lg font-medium mb-2">Aucun essayage sauvegardé</h2>
                    <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute max-w-sm mb-6">
                        Lance un essayage depuis un article de ta garde-robe, puis clique sur « Sauvegarder » pour le retrouver ici.
                    </p>
                    <Link
                        to="/garde-robe"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors"
                    >
                        <Shirt size={16} />
                        Aller à la garde-robe
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Mes essayages</h1>
            <p className="text-juju-light-texte-mute dark:text-juju-texte-mute mb-8 text-sm">
                {essayages.length} essayage{essayages.length > 1 ? 's' : ''} sauvegardé{essayages.length > 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {essayages.map((es) => (
                    <EssayageCard key={es.id_essayage} essayage={es} />
                ))}
            </div>
        </div>
    );
}

function EssayageCard({ essayage }) {
    const dateFr = essayage.cree_le
        ? new Date(essayage.cree_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        : '';

    return (
        <Link
            to={`/essayages/${essayage.id_essayage}`}
            className="group block bg-juju-light-card dark:bg-juju-bleu/30 border border-juju-light-bordure dark:border-juju-bordure rounded-lg overflow-hidden hover:border-juju-dore transition-colors"
        >
            <div className="aspect-[3/4] bg-juju-light-bg dark:bg-juju-noir overflow-hidden">
                {essayage.image_url_face ? (
                    <img
                        src={essayage.image_url_face}
                        alt={essayage.vetement_nom || 'Essayage'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Sparkles size={32} className="text-juju-dore opacity-30" />
                    </div>
                )}
            </div>
            <div className="p-3">
                <p className="text-sm font-medium truncate">{essayage.vetement_nom || 'Sans nom'}</p>
                <p className="text-[11px] text-juju-light-texte-mute dark:text-juju-texte-mute mt-0.5 flex items-center justify-between">
                    <span className="truncate">{essayage.categorie_nom || '—'}</span>
                    <span>{dateFr}</span>
                </p>
            </div>
        </Link>
    );
}