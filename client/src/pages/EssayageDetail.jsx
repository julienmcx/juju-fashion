import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2, Sparkles } from 'lucide-react';
import { fetchEssayage, deleteEssayage } from '../api/essayages';

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

    if (loading) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-juju-dore" />
                </div>
            </div>
        );
    }

    if (error || !essayage) {
        return (
            <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
                <Link to="/essayages" className="inline-flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore mb-6">
                    <ArrowLeft size={16} /> Retour
                </Link>
                <p className="text-red-400 text-sm">{error || 'Essayage introuvable'}</p>
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
                <Link to="/essayages" className="inline-flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore transition-colors">
                    <ArrowLeft size={16} /> Retour
                </Link>
                <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="inline-flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-red-400 transition-colors"
                >
                    <Trash2 size={16} /> Supprimer
                </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-medium mb-1">{essayage.vetement_nom || 'Essayage'}</h1>
            <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-6">
                {essayage.categorie_nom || '—'} · {dateFr}
            </p>

            {/* Image principale */}
            <div className="aspect-[3/4] max-w-md mx-auto bg-juju-light-bg dark:bg-juju-noir border border-juju-light-bordure dark:border-juju-bordure rounded-xl overflow-hidden mb-4">
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
                            className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${isActive
                                    ? 'border-juju-dore'
                                    : 'border-transparent hover:border-juju-light-bordure dark:hover:border-juju-bordure'
                                } ${!url ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            {url ? (
                                <img src={url} alt={angle.label} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-juju-light-card dark:bg-juju-bleu/30" />
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 text-center font-medium uppercase tracking-wider">
                                {angle.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Modale de confirmation */}
            {showConfirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-juju-light-card dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-medium mb-2">Supprimer cet essayage ?</h3>
                        <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-5">
                            Les 4 images de cet essayage seront définitivement supprimées. Cette action est irréversible.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 border border-juju-light-bordure dark:border-juju-bordure rounded-lg hover:border-juju-dore transition-colors disabled:opacity-60"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}