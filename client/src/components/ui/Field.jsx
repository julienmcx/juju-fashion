/**
 * Champs de formulaire harmonisés (focus → anneau violet).
 * <Input>, <Select>, <Textarea> + libellé optionnel.
 */
function Label({ label, required, htmlFor }) {
  if (!label) return null;
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-juju-light-texte-mute dark:text-juju-texte-mute mb-1.5"
    >
      {label}
      {required && <span className="text-juju-violet dark:text-juju-dore ml-1">*</span>}
    </label>
  );
}

export function Input({ label, required, hint, id, className = '', ...rest }) {
  return (
    <div>
      <Label label={label} required={required} htmlFor={id} />
      <input id={id} required={required} className={`field-input ${className}`} {...rest} />
      {hint && <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-1.5">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, required, hint, id, className = '', rows = 4, ...rest }) {
  return (
    <div>
      <Label label={label} required={required} htmlFor={id} />
      <textarea
        id={id}
        rows={rows}
        required={required}
        className={`field-input resize-none ${className}`}
        {...rest}
      />
      {hint && <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-1.5">{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  required,
  hint,
  id,
  options,
  placeholder,
  children,
  className = '',
  ...rest
}) {
  return (
    <div>
      <Label label={label} required={required} htmlFor={id} />
      <select id={id} required={required} className={`field-input appearance-none cursor-pointer ${className}`} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {hint && <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mt-1.5">{hint}</p>}
    </div>
  );
}
