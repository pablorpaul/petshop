export default function SelectField({ label, error, children, ...props }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select className={`field__input ${error ? 'field__input--error' : ''}`} {...props}>
        {children}
      </select>
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
