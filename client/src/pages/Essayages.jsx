import { useEffect, useState } from 'react';
import { Sparkles, Shirt } from 'lucide-react';
import { fetchEssayages } from '../api/essayages';
import { Button, Card, PageHeader } from '../components/ui';

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
                <PageHeader eyebrow="Tes looks gardés" title="Mes essayages" />
                <SkeletonGrid />
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
                <PageHeader eyebrow="Tes looks gardés" title="Mes essayages" />
                <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
        );
    }

    if (!essayages || essayages.length === 0) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
                <PageHeader
                    eyebrow="Tes looks gardés"
                    title="Mes essayages"
                    subtitle="Retrouve ici les essayages virtuels que tu as choisi de garder."
                />

                <div className="text-center py-20 max-w-sm mx-auto animate-fade-up">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-juju-violet/10 dark:bg-juju-dore/10 flex items-center justify-center text-juju-violet dark:text-juju-dore ring-1 ring-juju-violet/20 dark:ring-juju-dore/20">
                        <Sparkles size={28} />
                    </div>
                    <h2 className="font-display text-xl mb-2">Aucun essayage sauvegardé</h2>
                    <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">
                        Lance un essayage depuis un article de ta garde-robe, puis clique sur «&nbsp;Sauvegarder&nbsp;» pour le retrouver ici.
                    </p>
                    <Button to="/garde-robe" icon={Shirt}>Aller à la garde-robe</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 md:px-8 md:py-10 max-w-5xl mx-auto">
            <PageHeader
                eyebrow="Tes looks gardés"
                title="Mes essayages"
                subtitle={`${essayages.length} essayage${essayages.length > 1 ? 's' : ''} sauvegardé${essayages.length > 1 ? 's' : ''}`}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {essayages.map((es, i) => (
                    <EssayageCard key={es.id_essayage} essayage={es} index={i} />
                ))}
            </div>
        </div>
    );
}

function EssayageCard({ essayage, index = 0 }) {
    const dateFr = essayage.cree_le
        ? new Date(essayage.cree_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        : '';

    return (
        <Card
            hover
            accent="violet"
            to={`/essayages/${essayage.id_essayage}`}
            className="overflow-hidden group animate-fade-up opacity-0"
            style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
        >
            <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-juju-light-bg to-juju-light-bordure/50 dark:from-juju-bleu/60 dark:to-juju-noir">
                {essayage.image_url_face ? (
                    <img
                        src={essayage.image_url_face}
                        alt={essayage.vetement_nom || 'Essayage'}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-juju-violet/40 dark:text-juju-dore/30">
                        <Sparkles size={32} />
                    </div>
                )}
            </div>
            <div className="p-3">
                <p className="font-semibold text-sm leading-tight truncate">{essayage.vetement_nom || 'Sans nom'}</p>
                <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate">{essayage.categorie_nom || '—'}</span>
                    <span className="shrink-0">{dateFr}</span>
                </p>
            </div>
        </Card>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-juju-light-bordure dark:border-juju-bordure overflow-hidden">
                    <div className="aspect-[3/4] skeleton bg-juju-light-card dark:bg-juju-bleu/60" />
                    <div className="p-3 space-y-2">
                        <div className="h-3 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded w-3/4" />
                        <div className="h-2.5 skeleton bg-juju-light-bordure/60 dark:bg-juju-bleu/60 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
