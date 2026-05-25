import { useEffect, useState, useRef } from 'react';
import {
  Mail, User as UserIcon, LogOut, Sparkles, Shirt, Wallet,
  Camera, Settings as SettingsIcon, Sun, Moon, Loader2, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProfileStats, updateAvatar } from '../api/profile';
import { uploadImage, removeBackground } from '../api/upload';
import { useDensity } from '../hooks/useDensity';
import { useTheme } from '../hooks/useTheme';

export default function Profil() {
  const { user, logout } = useAuth();
  const [density, setDensity] = useDensity();
  const [theme, setTheme] = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const loadStats = async () => {
    try {
      const data = await fetchProfileStats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { url: originalUrl } = await uploadImage(file);
      // Tentative de détourage (cohérent avec le flow d'ajout d'article)
      let finalUrl = originalUrl;
      try {
        const { url } = await removeBackground(originalUrl);
        finalUrl = url;
      } catch {
        // détourage échoué, on garde l'original
      }
      await updateAvatar(finalUrl);
      await loadStats();
    } catch (err) {
      alert("Impossible de mettre à jour l'avatar : " + (err.response?.data?.error || err.message));
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Retirer la photo de profil ?')) return;
    setUploadingAvatar(true);
    try {
      await updateAvatar(null);
      await loadStats();
    } catch {
      alert('Suppression impossible.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatarSrc = stats?.avatar?.custom_url;

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
      {/* Header avec avatar uploadable */}
      <header className="flex items-center gap-4 mb-8">
        <div className="relative group">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label="Changer la photo de profil"
            className="block w-20 h-20 rounded-full overflow-hidden border-2 border-juju-dore bg-juju-bleu dark:bg-juju-bleu hover:opacity-80 transition-opacity"
          >
            {uploadingAvatar ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-juju-dore" />
              </div>
            ) : avatarSrc ? (
              <img src={avatarSrc} alt="Photo de profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon size={32} className="text-juju-light-texte-mute dark:text-juju-texte-mute" />
              </div>
            )}
          </button>
          {/* Mini caméra en bas à droite */}
          {!uploadingAvatar && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-juju-dore text-juju-noir flex items-center justify-center hover:bg-juju-dore-clair transition-colors"
              title="Changer la photo"
            >
              <Camera size={14} />
            </button>
          )}
          {/* Bouton retirer (visible si avatar existant) */}
          {avatarSrc && !uploadingAvatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-juju-noir/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              title="Retirer la photo"
            >
              <X size={12} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-medium truncate">
            {user?.nom || user?.email?.split('@')[0]}
          </h1>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute dark:text-juju-light-texte-mute dark:text-juju-texte-mute truncate">
            {user?.email}
          </p>
        </div>
      </header>

      {/* Stats */}
      {loading && <SkeletonStats />}
      {!loading && stats && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard
              icon={Shirt}
              value={stats.articles.total}
              label={stats.articles.total > 1 ? 'vêtements' : 'vêtement'}
            />
            <StatCard
              icon={Sparkles}
              value={stats.essayages.total}
              label={stats.essayages.total > 1 ? 'essayages' : 'essayage'}
              sublabel={stats.essayages.today > 0 ? `+${stats.essayages.today} aujourd'hui` : null}
            />
            <StatCard
              icon={Wallet}
              value={`${Math.round(stats.articles.valeur_totale)} €`}
              label="garde-robe"
              valueClass="text-xl md:text-2xl"
            />
          </div>

          {stats.articles.par_categorie.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs uppercase tracking-widest text-juju-light-texte-mute dark:text-juju-texte-mute mb-3">
                Répartition par catégorie
              </h2>
              <div className="space-y-2">
                {stats.articles.par_categorie.map((cat) => (
                  <CategoryBar
                    key={cat.categorie}
                    nom={cat.categorie}
                    count={cat.count}
                    total={stats.articles.total}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Compte */}
      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-widest text-juju-light-texte-mute dark:text-juju-texte-mute mb-3">
          Mon compte
        </h2>
        <div className="space-y-1">
          <InfoRow icon={UserIcon} label="Pseudo" value={user?.nom || '—'} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
        </div>
      </section>

      {/* Paramètres */}
      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-widest text-juju-light-texte-mute dark:text-juju-texte-mute mb-3">
          <SettingsIcon size={12} className="inline mr-1" />
          Paramètres
        </h2>

        <div className="space-y-3">
          {/* Thème */}
          <div className="p-4 bg-juju-bleu/10 dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg">
            <p className="text-sm font-medium mb-3">Apparence</p>
            <div className="grid grid-cols-2 gap-2">
              <ToggleOption
                icon={Sun}
                label="Clair"
                value="light"
                current={theme}
                onChange={setTheme}
              />
              <ToggleOption
                icon={Moon}
                label="Sombre"
                value="dark"
                current={theme}
                onChange={setTheme}
              />
            </div>
          </div>

          {/* Densité */}
          <div className="p-4 bg-juju-bleu/10 dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg">
            <p className="text-sm font-medium mb-3">Densité d'affichage</p>
            <div className="grid grid-cols-2 gap-2">
              <ToggleOption
                label="Confortable"
                value="comfortable"
                current={density}
                onChange={setDensity}
              />
              <ToggleOption
                label="Compact"
                value="compact"
                current={density}
                onChange={setDensity}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Déconnexion */}
      <section>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte-mute dark:text-juju-texte-mute rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
      </section>
    </div>
  );
}


function StatCard({ icon: Icon, value, label, sublabel, valueClass }) {
  return (
    <div className="p-4 bg-juju-bleu/10 dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg text-center">
      <Icon size={18} className="mx-auto mb-2 text-juju-dore" />
      <p className={`font-medium ${valueClass || 'text-2xl md:text-3xl'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-juju-light-texte-mute dark:text-juju-texte-mute mt-1">{label}</p>
      {sublabel && <p className="text-[10px] text-juju-dore mt-1">{sublabel}</p>}
    </div>
  );
}

function CategoryBar({ nom, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm flex-1 truncate">{nom || 'Sans catégorie'}</span>
      <div className="flex items-center gap-2 w-32">
        <div className="flex-1 h-1.5 bg-juju-bordure rounded-full overflow-hidden">
          <div
            className="h-full bg-juju-dore transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute w-6 text-right">{count}</span>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-juju-bleu/10 dark:bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg">
      <Icon size={18} className="text-juju-dore" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function ToggleOption({ icon: Icon, label, value, current, onChange }) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
        isActive
          ? 'bg-juju-dore text-juju-noir border-juju-dore'
          : 'bg-transparent text-juju-texte border-juju-light-bordure dark:border-juju-bordure hover:border-juju-texte-mute'
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aspect-square bg-juju-bleu/30 dark:bg-juju-bleu/60 rounded-lg" />
      ))}
    </div>
  );
}