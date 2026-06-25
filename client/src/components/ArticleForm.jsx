import { useState } from 'react';
import { Save, Plus, Check } from 'lucide-react';
import { createMarque } from '../api/referentiels';
import { Button, SectionLabel } from './ui';
import { useToast } from '../contexts/ToastContext';
import { Save, Plus, Check, Trash2 } from 'lucide-react';
import { createMarque, deleteMarque } from '../api/referentiels';
import ConfirmDialog from './ConfirmDialog';

const ORIGINES = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'fripe', label: 'Fripe' },
  { value: 'seconde_main', label: 'Seconde main' },
  { value: 'cadeau', label: 'Cadeau' },
  { value: 'fait_main', label: 'Fait main' },
  { value: 'autre', label: 'Autre' },
];

export default function ArticleForm({
  initialValues,
  referentiels,
  setMarques,
  onSubmit,
  submitLabel = 'Enregistrer',
  onCancel,
}) {
  const [form, setForm] = useState({
    nom: initialValues.nom || '',
    image_url: initialValues.image_url || '',
    id_categorie: initialValues.id_categorie || '',
    id_marque: initialValues.id_marque || '',
    prix: initialValues.prix || '',
    devise: initialValues.devise || 'EUR',
    origine: initialValues.origine || 'autre',
    taille: initialValues.taille || '',
    pointure: initialValues.pointure || '',
    longueur_cm: initialValues.longueur_cm || '',
    matiere_bijou: initialValues.matiere_bijou || '',
    lunettes_teintees: initialValues.lunettes_teintees ?? null,
    lien_achat: initialValues.lien_achat || '',
    notes: initialValues.notes || '',
  });
  const [selectedCouleurs, setSelectedCouleurs] = useState(
    initialValues.couleurs_ids || []
  );
  const [selectedMatieres, setSelectedMatieres] = useState(
    initialValues.matieres_with_pct || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);
  const toast = useToast();

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleCouleur = (id) =>
    setSelectedCouleurs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleMatiere = (id) =>
    setSelectedMatieres((prev) => {
      const exists = prev.find((m) => m.id_matiere === id);
      if (exists) return prev.filter((m) => m.id_matiere !== id);
      return [...prev, { id_matiere: id, pourcentage: null }];
    });

  const setMatierePourcentage = (id, value) =>
    setSelectedMatieres((prev) =>
      prev.map((m) =>
        m.id_matiere === id
          ? { ...m, pourcentage: value === '' ? null : Number(value) }
          : m
      )
    );

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setCreatingBrand(true);
    try {
      const marque = await createMarque(newBrandName.trim());
      setMarques((prev) =>
        prev.find((m) => m.id_marque === marque.id_marque) ? prev : [...prev, marque]
      );
      setField('id_marque', marque.id_marque);
      setNewBrandName('');
      setShowNewBrand(false);
    } catch {
      toast.error('Création de la marque impossible.');
    } finally {
      setCreatingBrand(false);
    }
  };

  const [deletingBrand, setDeletingBrand] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null); // { id_marque, nom_marque } | null

  const handleDeleteBrand = async () => {
    if (!form.id_marque) return;
    const marque = referentiels.marques.find((m) => m.id_marque === form.id_marque);
    const nom = marque?.nom_marque || 'cette marque';
    if (!window.confirm(
      `Supprimer la marque « ${nom} » ?\nLes articles qui l'utilisaient n'auront plus de marque.`
    )) return;
    setDeletingBrand(true);
    try {
      await deleteMarque(form.id_marque);
      setMarques((prev) => prev.filter((m) => m.id_marque !== form.id_marque));
      setField('id_marque', '');
      toast.success('Marque supprimée.');
    } catch {
      toast.error('Suppression de la marque impossible.');
    } finally {
      setDeletingBrand(false);
    }
  };

  const askDeleteBrand = () => {
    if (!form.id_marque) return;
    const marque = referentiels.marques.find((m) => m.id_marque === form.id_marque);
    if (marque) setBrandToDelete(marque);
  };

  const confirmDeleteBrand = async () => {
    if (!brandToDelete) return;
    setDeletingBrand(true);
    try {
      await deleteMarque(brandToDelete.id_marque);
      setMarques((prev) => prev.filter((m) => m.id_marque !== brandToDelete.id_marque));
      setField('id_marque', '');
      toast.success('Marque supprimée.');
      setBrandToDelete(null);
    } catch {
      toast.error('Suppression de la marque impossible.');
    } finally {
      setDeletingBrand(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        id_marque: form.id_marque || null,
        prix: form.prix === '' ? null : Number(form.prix),
        pointure: form.pointure === '' ? null : Number(form.pointure),
        longueur_cm: form.longueur_cm === '' ? null : Number(form.longueur_cm),
        taille: form.taille || null,
        matiere_bijou: form.matiere_bijou || null,
        lien_achat: form.lien_achat || null,
        notes: form.notes || null,
        couleurs: selectedCouleurs,
        matieres: selectedMatieres,
      };
      await onSubmit(payload);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible.');
      setSaving(false);
    }
  };

  const [deletingBrand, setDeletingBrand] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Informations principales">
        <Input
          label="Nom"
          value={form.nom}
          onChange={(v) => setField('nom', v)}
          required
        />

        <Input
          label="URL de l'image"
          value={form.image_url}
          onChange={(v) => setField('image_url', v)}
          type="url"
          required
        />

        <Select
          label="Catégorie"
          value={form.id_categorie}
          onChange={(v) => setField('id_categorie', v ? Number(v) : '')}
          options={referentiels.categories.map((c) => ({
            value: c.id_categorie,
            label: c.nom,
          }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-juju-light-texte-mute dark:text-juju-texte-mute mb-1.5">Marque</label>
          <div className="flex gap-2">
            <select
              value={form.id_marque}
              onChange={(e) =>
                setField('id_marque', e.target.value ? Number(e.target.value) : '')
              }
              className="field-input appearance-none cursor-pointer flex-1"
            >
              <option value="">— Aucune —</option>
              {referentiels.marques.map((m) => (
                <option key={m.id_marque} value={m.id_marque}>
                  {m.nom_marque}
                </option>
              ))}
            </select>
            {form.id_marque && (
              <button
                type="button"
                onClick={askDeleteBrand}
                className="shrink-0 w-12 rounded-xl border border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte-mute dark:text-juju-texte-mute hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center"
                title="Supprimer cette marque"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowNewBrand((s) => !s)}
              className="shrink-0 w-12 rounded-xl border border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte-mute dark:text-juju-texte-mute hover:border-juju-violet hover:text-juju-violet dark:hover:text-juju-dore transition-colors flex items-center justify-center"
              title="Nouvelle marque"
            >
              <Plus size={18} />
            </button>
          </div>

          {showNewBrand && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Nom de la nouvelle marque"
                className="field-input flex-1 py-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreateBrand}
                loading={creatingBrand}
                disabled={creatingBrand || !newBrandName.trim()}
              >
                Créer
              </Button>
            </div>
          )}
        </div>
      </Section>

      <Section title="Prix et origine">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prix"
            type="number"
            step="0.01"
            value={form.prix}
            onChange={(v) => setField('prix', v)}
          />
          <Select
            label="Devise"
            value={form.devise}
            onChange={(v) => setField('devise', v)}
            options={[
              { value: 'EUR', label: '€ EUR' },
              { value: 'USD', label: '$ USD' },
              { value: 'GBP', label: '£ GBP' },
            ]}
          />
        </div>

        <Select
          label="Origine"
          value={form.origine}
          onChange={(v) => setField('origine', v)}
          options={ORIGINES}
        />

        <Input
          label="Taille"
          value={form.taille}
          onChange={(v) => setField('taille', v)}
          placeholder="M, 38, L/XL..."
        />
      </Section>

      <Section title="Couleurs">
        <div className="flex flex-wrap gap-2">
          {referentiels.couleurs.map((c) => {
            const isSelected = selectedCouleurs.includes(c.id_couleur);
            return (
              <button
                type="button"
                key={c.id_couleur}
                onClick={() => toggleCouleur(c.id_couleur)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-colors ${isSelected
                  ? 'border-juju-violet bg-juju-violet/10 text-juju-violet dark:text-juju-dore'
                  : 'border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte dark:text-juju-texte hover:border-juju-violet'
                  }`}
              >
                <div
                  className="w-3 h-3 rounded-full border border-juju-light-bordure dark:border-juju-bordure"
                  style={{ backgroundColor: c.code_hex }}
                />
                {c.nom}
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Matières">
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute -mt-3 mb-2">
          Sélectionne les matières et précise leur pourcentage si tu le connais.
        </p>
        <div className="space-y-2">
          {referentiels.matieres.map((mat) => {
            const selected = selectedMatieres.find((m) => m.id_matiere === mat.id_matiere);
            return (
              <div
                key={mat.id_matiere}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${selected ? 'border-juju-violet bg-juju-violet/5' : 'border-juju-light-bordure dark:border-juju-bordure'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => toggleMatiere(mat.id_matiere)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center text-white transition-colors ${selected ? 'bg-gradient-violet border-transparent' : 'border-juju-light-texte-mute dark:border-juju-texte-mute'
                    }`}
                >
                  {selected && <Check size={14} />}
                </button>
                <span className="flex-1 text-sm">{mat.nom}</span>
                {selected && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={selected.pourcentage ?? ''}
                      onChange={(e) =>
                        setMatierePourcentage(mat.id_matiere, e.target.value)
                      }
                      placeholder="%"
                      className="field-input w-20 py-1.5 text-sm text-right"
                    />
                    <span className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute">%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Spécificités (optionnel)">
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute -mt-3 mb-2">
          Pointure pour les chaussures, longueur pour les ceintures, etc.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Pointure"
            type="number"
            step="0.5"
            value={form.pointure}
            onChange={(v) => setField('pointure', v)}
          />
          <Input
            label="Longueur (cm)"
            type="number"
            step="0.1"
            value={form.longueur_cm}
            onChange={(v) => setField('longueur_cm', v)}
          />
        </div>

        <Input
          label="Matière (bijou)"
          value={form.matiere_bijou}
          onChange={(v) => setField('matiere_bijou', v)}
          placeholder="or, argent, plaqué or..."
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.lunettes_teintees === true}
            onChange={(e) =>
              setField('lunettes_teintees', e.target.checked ? true : null)
            }
            className="w-4 h-4 accent-juju-violet"
          />
          Verres teintés (pour des lunettes)
        </label>
      </Section>

      <Section title="Notes et achat">
        <Input
          label="Lien d'achat"
          type="url"
          value={form.lien_achat}
          onChange={(v) => setField('lien_achat', v)}
          placeholder="https://..."
        />

        <div>
          <label className="block text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            rows={4}
            className="field-input resize-none"
            placeholder="Anecdote, taille qui taille petit, conseils d'entretien…"
          />
        </div>
      </Section>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-5 border-t border-juju-light-bordure dark:border-juju-bordure">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" variant="primary" icon={Save} loading={saving}>
          {saving ? 'Enregistrement…' : submitLabel}
        </Button>
      </div>

      {brandToDelete && (
        <ConfirmDialog
          title="Supprimer la marque"
          message={`Supprimer « ${brandToDelete.nom_marque} » ? Les articles qui l'utilisaient ne seront pas supprimés, ils n'auront simplement plus de marque.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          confirmVariant="danger"
          loading={deletingBrand}
          onConfirm={confirmDeleteBrand}
          onCancel={() => !deletingBrand && setBrandToDelete(null)}
        />
      )}

    </form>
  );
}

/* ----- Composants utilitaires internes ----- */

function Section({ title, children }) {
  return (
    <section>
      <SectionLabel className="mb-4">{title}</SectionLabel>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, type = 'text', required, placeholder, step }) {
  return (
    <div>
      <label className="block text-sm font-medium text-juju-light-texte-mute dark:text-juju-texte-mute mb-1.5">
        {label}
        {required && <span className="text-juju-violet dark:text-juju-dore ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        step={step}
        className="field-input"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-juju-light-texte-mute dark:text-juju-texte-mute mb-1.5">
        {label}
        {required && <span className="text-juju-violet dark:text-juju-dore ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="field-input appearance-none cursor-pointer"
      >
        <option value="">— Choisir —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}