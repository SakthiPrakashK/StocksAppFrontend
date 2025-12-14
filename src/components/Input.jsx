const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-dark-text mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-3 bg-dark-tertiary border rounded-lg
          text-dark-text placeholder-dark-muted
          focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
          transition-all duration-200
          ${error ? 'border-accent-danger' : 'border-dark-border'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-danger">{error}</p>
      )}
    </div>
  )
}

export default Input


