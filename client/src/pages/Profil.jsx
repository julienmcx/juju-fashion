import { useEffect, useState, useRef } from 'react';
import {
  Mail, User as UserIcon, LogOut, Sparkles, Shirt, Wallet,
  Camera, Settings as SettingsIcon, Sun, Moon, Loader2, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProfileStats, updateAvatar } from '../api/profile';
import { uploadImage } from '../api/upload';
import { useDensity } from '../hooks/useDensity';
import { useTheme } from '../hooks/useTheme';
import { Card, Eyebrow, SectionLabel, Button } from '../components/ui';
import { useToast } from '../contexts/ToastContext';

export default function Profil() {
  const { user, logout } = useAuth();
  const [density, setDensity] = useDensity();
  const [theme, setTheme] = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

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
      const { url } = await uploadImage(file);
      // Photo de profil = on garde l'image telle quelle (pas de détourage = pas de tokens FASHN)
      await updateAvatar(url);
      await loadStats();
    } catch (err) {
      toast.error("Impossible de mettre à jour l'avatar : " + (err.response?.data?.error || err.message));
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
      toast.error('Suppression impossible.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatarSrc = stats?.avatar?.custom_url;

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-3xl mx-auto">
      {/* Header avec avatar uploadable */}
      <header className="flex items-center gap-5 mb-9">
        <div className="relative group shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            aria-label="Changer la photo de profil"
            className="block w-24 h-24 rounded-full overflow-hidden p-[3px] bg-gradient-violet-gold hover:opacity-90 transition-opacity"
          >
            <span className="block w-full h-full rounded-full overflow-hidden bg-juju-light-card dark:bg-juju-bleu">
              {uploadingAvatar ? (
                <span className="w-full h-full flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-juju-violet dark:text-juju-dore" />
                </span>
              ) : avatarSrc ? (
                <img src={avatarSrc} alt="Photo de profil" className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center">
                  <UserIcon size={34} className="text-juju-light-texte-mute dark:text-juju-texte-mute" />
                </span>
              )}
            </span>
          </button>
          {!uploadingAvatar && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full bg-gradient-violet text-white flex items-center justify-center shadow-violet-sm hover:-translate-y-0.5 transition-transform"
              title="Changer la photo"
            >
              <Camera size={15} />
            </button>
          )}
          {avatarSrc && !uploadingAvatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-juju-light-card dark:bg-juju-noir border border-juju-light-bordure dark:border-juju-bordure hover:bg-red-500 hover:text-white hover:border-red-500 text-juju-light-texte-mute dark:text-juju-texte-mute flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
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
          <Eyebrow>Mon profil</Eyebrow>
          <h1 className="font-display text-3xl md:text-4xl truncate mt-1.5">
            {user?.nom || user?.email?.split('@')[0]}
          </h1>
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute truncate">
            {user?.email}
          </p>
        </div>
      </header>

      {/* Stats */}
      {loading && <SkeletonStats />}
      {!loading && stats && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-9">
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
            />
          </div>

          {stats.articles.par_categorie.length > 0 && (
            <section className="mb-9">
              <SectionLabel className="mb-4">Répartition par catégorie</SectionLabel>
              <Card className="p-5 space-y-3.5">
                {stats.articles.par_categorie.map((cat) => (
                  <CategoryBar
                    key={cat.categorie}
                    nom={cat.categorie}
                    count={cat.count}
                    total={stats.articles.total}
                  />
                ))}
              </Card>
            </section>
          )}
        </>
      )}

      {/* Compte */}
      <section className="mb-7">
        <SectionLabel className="mb-4">Mon compte</SectionLabel>
        <div className="space-y-2.5">
          <InfoRow icon={UserIcon} label="Pseudo" value={user?.nom || '—'} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
        </div>
      </section>

      {/* Paramètres */}
      <section className="mb-7">
        <SectionLabel icon={SettingsIcon} className="mb-4">Paramètres</SectionLabel>

        <div className="space-y-3">
          <Card className="p-5">
            <p className="text-sm font-semibold mb-3">Apparence</p>
            <div className="grid grid-cols-2 gap-2.5">
              <ToggleOption icon={Sun} label="Clair" value="light" current={theme} onChange={setTheme} />
              <ToggleOption icon={Moon} label="Sombre" value="dark" current={theme} onChange={setTheme} />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold mb-3">Densité d'affichage</p>
            <div className="grid grid-cols-2 gap-2.5">
              <ToggleOption label="Confortable" value="comfortable" current={density} onChange={setDensity} />
              <ToggleOption label="Compact" value="compact" current={density} onChange={setDensity} />
            </div>
          </Card>
        </div>
      </section>

      {/* Déconnexion */}
      <Button variant="danger-soft" size="lg" fullWidth icon={LogOut} onClick={logout}>
        Se déconnecter
      </Button>
    </div>
  );
}


function StatCard({ icon: Icon, value, label, sublabel }) {
  return (
    <Card className="p-4 text-center">
      <Icon size={18} className="mx-auto mb-2 text-juju-dore" />
      <p className="stat-gradient text-2xl md:text-3xl leading-none">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-juju-light-texte-mute dark:text-juju-texte-mute mt-2">{label}</p>
      {sublabel && <p className="text-[10px] text-juju-violet dark:text-juju-dore mt-1 font-semibold">{sublabel}</p>}
    </Card>
  );
}

function CategoryBar({ nom, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm flex-1 truncate">{nom || 'Sans catégorie'}</span>
      <div className="flex items-center gap-2.5 w-36">
        <div className="flex-1 h-2 bg-juju-light-bordure/70 dark:bg-juju-bordure rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-juju-violet to-juju-dore transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute w-6 text-right tabular-nums">{count}</span>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-3.5 p-4">
      <div className="w-10 h-10 rounded-xl bg-juju-violet/10 dark:bg-juju-dore/10 flex items-center justify-center text-juju-violet dark:text-juju-dore shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute">{label}</p>
        <p className="font-semibold truncate">{value}</p>
      </div>
    </Card>
  );
}

function ToggleOption({ icon: Icon, label, value, current, onChange }) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isActive
        ? 'bg-gradient-violet text-white border-transparent shadow-violet-sm'
        : 'bg-transparent text-juju-light-texte dark:text-juju-texte border-juju-light-bordure dark:border-juju-bordure hover:border-juju-violet dark:hover:border-juju-dore'
        }`}
    >
      {Icon && <Icon size={15} />}
      {label}
    </button>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-3 mb-9">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aspect-square skeleton bg-juju-light-card dark:bg-juju-bleu/40 border border-juju-light-bordure dark:border-juju-bordure rounded-2xl" />
      ))}
    </div>
  );
}
