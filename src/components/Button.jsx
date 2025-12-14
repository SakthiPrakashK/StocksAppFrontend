const variants = {
  primary: 'bg-accent-primary hover:bg-accent-primary/90 text-white',
  secondary: 'bg-dark-tertiary hover:bg-dark-border text-dark-text',
  success: 'bg-accent-success hover:bg-accent-success/90 text-white',
  danger: 'bg-accent-danger hover:bg-accent-danger/90 text-white',
  outline: 'border border-dark-border hover:bg-dark-tertiary text-dark-text',
  ghost: 'hover:bg-dark-tertiary text-dark-text'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="spinner w-4 h-4"></div>
      )}
      {children}
    </button>
  )
}

export default Button


