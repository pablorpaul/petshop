export default function InputField({ label, error, hint, ...props }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className={`field__input ${error ? 'field__input--error' : ''}`} {...props} />
      {error ? <span className="field__error">{error}</span> : hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}
