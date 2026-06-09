import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2, Sparkles } from 'lucide-react';
import { fetchEssayage, deleteEssayage } from '../api/essayages';
import { Button } from '../components/ui';

const ANGLES = [
    { key: 'face', label: 'Face', col: 'image_url_face' },
    { key: 'profil_droit', label: 'Profil D', col: 'image_url_profil_droit' },
    { key: 'dos', label: 'Dos', col: 'image_url_dos' },
    { key: 'profil_gauche', label: 'Profil G', col: 'image_url_profil_gauche' },
];

export default function EssayageDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [essayage, setEssayage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentAngle, setCurrentAngle] = useState('face');
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchEssayage(id)
            .then((data) => setEssayage(data.essayage))
            .catch((err) => setError(err.response?.data?.error || 'Essayage introuvable'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteEssayage(id);
            navigate('/essayages');
        } catch (err) {
            alert('Suppression impossible : ' + (err.response?.data?.error || err.message));
            setDeleting(false);
            setShowConfirmDelete(false);
        }
    };

    const backLinkClass =
        'inline-flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-violet dark:hover:text-juju-dore transition-colors';

    if (loading) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-juju-violet dark:text-juju-dore" />
                </div>
            </div>
        );
    }

    if (error || !essayage) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
                <Link to="/essayages" className={`${backLinkClass} mb-6`}>
                    <ArrowLeft size={16} /> Retour
                </Link>
                <p className="text-red-500 text-sm font-medium">{error || 'Essayage introuvable'}</p>
            </div>
        );
    }

    const currentUrl = essayage[ANGLES.find((a) => a.key === currentAngle).col];
    const dateFr = essayage.cree_le
        ? new Date(essayage.cree_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    return (
        <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link to="/essayages" className={backLinkClass}>
                    <ArrowLeft size={16} /> Retour
                </Link>
                <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setShowConfirmDelete(true)}
                    className="hover:!text-red-500 dark:hover:!text-red-500 hover:!bg-red-500/5"
                >
                    Supprimer
                </Button>
            </div>

            <h1 className="font-display text-3xl md:text-4xl leading-[1.08] text-juju-light-texte dark:text-juju-texte mb-1.5">
                {essayage.vetement_nom || 'Essayage'}
            </h1>
            <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">
                {essayage.categorie_nom || '—'} · {dateFr}
            </p>

            {/* Image principale */}
            <div className="aspect-[3/4] max-w-md mx-auto rounded-2xl border border-juju-light-bordure dark:border-juju-bordure shadow-card overflow-hidden mb-4 bg-gradient-to-br from-juju-light-bg to-juju-light-bordure/50 dark:from-juju-bleu/60 dark:to-juju-noir">
                {currentUrl ? (
                    <img src={currentUrl} alt={`Angle ${currentAngle}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-juju-light-texte-mute dark:text-juju-texte-mute">
                        <Sparkles size={32} className="opacity-30 mb-2" />
                        <p className="text-xs">Angle non disponible</p>
                    </div>
                )}
            </div>

            {/* Thumbnails 4 angles */}
            <div className="grid grid-cols-4 gap-2 max-w-md mx-auto mb-8">
                {ANGLES.map((angle) => {
                    const url = essayage[angle.col];
                    const isActive = currentAngle === angle.key;
                    return (
                        <button
                            key={angle.key}
                            onClick={() => setCurrentAngle(angle.key)}
                            disabled={!url}
                            className={`group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${isActive
                                    ? 'border-juju-violet'
                                    : 'border-transparent hover:border-juju-light-bordure dark:hover:border-juju-bordure'
                                } ${!url ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            {url ? (
                                <img src={url} alt={angle.label} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-juju-light-card dark:bg-juju-bleu/30" />
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-juju-noir/60 text-white text-[10px] py-1 text-center font-medium uppercase tracking-wider">
                                {angle.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Modale de confirmation */}
            {showConfirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-juju-noir/50 backdrop-blur-sm">
                    <div className="bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
                        <h3 className="font-display text-xl mb-2">Supprimer cet essayage ?</h3>
                        <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-5">
                            Les 4 images de cet essayage seront définitivement supprimées. Cette action est irréversible.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="md"
                                fullWidth
                                disabled={deleting}
                                onClick={() => setShowConfirmDelete(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="danger"
                                size="md"
                                fullWidth
                                icon={Trash2}
                                loading={deleting}
                                onClick={handleDelete}
                            >
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
