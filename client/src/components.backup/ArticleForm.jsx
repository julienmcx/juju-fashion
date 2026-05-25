import { useState } from 'react';
import { Save, Plus, Check } from 'lucide-react';
import { createMarque } from '../api/referentiels';

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
      alert('Création de la marque impossible.');
    } finally {
      setCreatingBrand(false);
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
      setError(err.response?.data?.error || 'Enregistrement impossible.');
      setSaving(false);
    }
  };

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
          <label className="block text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-1">Marque</label>
          <div className="flex gap-2">
            <select
              value={form.id_marque}
              onChange={(e) =>
                setField('id_marque', e.target.value ? Number(e.target.value) : '')
              }
              className="flex-1 px-4 py-3 bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg text-juju-texte focus:outline-none focus:border-juju-dore"
            >
              <option value="">— Aucune —</option>
              {referentiels.marques.map((m) => (
                <option key={m.id_marque} value={m.id_marque}>
                  {m.nom_marque}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewBrand((s) => !s)}
              className="px-4 py-3 border border-juju-light-bordure dark:border-juju-bordure rounded-lg text-juju-light-texte-mute dark:text-juju-texte-mute hover:border-juju-dore hover:text-juju-dore transition-colors"
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
                className="flex-1 px-4 py-2 bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg text-sm focus:outline-none focus:border-juju-dore"
              />
              <button
                type="button"
                onClick={handleCreateBrand}
                disabled={creatingBrand || !newBrandName.trim()}
                className="px-4 py-2 bg-juju-dore text-juju-noir text-sm font-medium rounded-lg hover:bg-juju-dore-clair disabled:opacity-50"
              >
                {creatingBrand ? '…' : 'Créer'}
              </button>
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
                className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-colors ${
                  isSelected
                    ? 'border-juju-dore bg-juju-dore/10 text-juju-dore'
                    : 'border-juju-light-bordure dark:border-juju-bordure text-juju-texte hover:border-juju-texte-mute'
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
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  selected ? 'border-juju-dore bg-juju-dore/5' : 'border-juju-light-bordure dark:border-juju-bordure'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleMatiere(mat.id_matiere)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    selected ? 'bg-juju-dore border-juju-dore' : 'border-juju-texte-mute'
                  }`}
                >
                  {selected && <Check size={14} className="text-juju-noir" />}
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
                      className="w-20 px-2 py-1 bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded text-sm text-right focus:outline-none focus:border-juju-dore"
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
            className="w-4 h-4 accent-juju-dore"
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
            className="w-full px-4 py-3 bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg text-juju-texte focus:outline-none focus:border-juju-dore resize-none"
            placeholder="Anecdote, taille qui taille petit, conseils d'entretien…"
          />
        </div>
      </Section>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-juju-light-bordure dark:border-juju-bordure">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-center px-6 py-3 border border-juju-light-bordure dark:border-juju-bordure text-juju-texte rounded-lg hover:bg-juju-light-card dark:bg-juju-bleu-clair transition-colors"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Enregistrement…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ----- Composants utilitaires internes ----- */

function Section({ title, children }) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-widest text-juju-light-texte-mute dark:text-juju-texte-mute mb-4">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, type = 'text', required, placeholder, step }) {
  return (
    <div>
      <label className="block text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-1">
        {label}
        {required && <span className="text-juju-dore ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        step={step}
        className="w-full px-4 py-3 bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg text-juju-texte focus:outline-none focus:border-juju-dore transition-colors"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-1">
        {label}
        {required && <span className="text-juju-dore ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 bg-juju-bleu border border-juju-light-bordure dark:border-juju-bordure rounded-lg text-juju-texte focus:outline-none focus:border-juju-dore"
      >
        <option value="">— Choisir —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}