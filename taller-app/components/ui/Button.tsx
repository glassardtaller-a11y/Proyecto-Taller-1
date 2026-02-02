import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const variantClasses = {
    primary: `
    bg-gradient-to-r from-accent-orange to-accent-amber
    text-white font-medium
    hover:from-accent-orange-hover hover:to-accent-amber-hover
    hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]
    active:scale-[0.98]
  `,
    secondary: `
    bg-glass border border-glass-border
    text-foreground
    hover:bg-glass-hover hover:border-glass-border-hover
    active:bg-glass-active
  `,
    ghost: `
    bg-transparent
    text-foreground-muted
    hover:bg-glass hover:text-foreground
    active:bg-glass-hover
  `,
    danger: `
    bg-accent-rose/10 border border-accent-rose/20
    text-accent-rose
    hover:bg-accent-rose/20 hover:border-accent-rose/30
    active:bg-accent-rose/30
  `,
    success: `
    bg-accent-emerald/10 border border-accent-emerald/20
    text-accent-emerald
    hover:bg-accent-emerald/20 hover:border-accent-emerald/30
    active:bg-accent-emerald/30
  `,
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2',
    icon: 'p-2 rounded-lg',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        inline-flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-accent-orange/50 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : (
                <>
                    {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
}

// Icon Button para acciones rápidas
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    label: string; // Para accesibilidad
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    className = '',
    ...props
}: IconButtonProps) {
    const iconSizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    return (
        <button
            aria-label={label}
            title={label}
            className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-accent-orange/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${iconSizeClasses[size]}
        ${className}
      `}
            {...props}
        >
            {icon}
        </button>
    );
}
