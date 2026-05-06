export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''}`.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="btn__spinner" /> : icon ? <span className="btn__icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
