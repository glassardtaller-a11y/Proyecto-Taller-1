import { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'orange';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
    pulse?: boolean;
    className?: string;
}

const variantClasses = {
    default: 'bg-glass border-glass-border text-foreground-muted',
    success: 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald',
    warning: 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber',
    danger: 'bg-accent-rose/10 border-accent-rose/20 text-accent-rose',
    info: 'bg-accent-sky/10 border-accent-sky/20 text-accent-sky',
    orange: 'bg-accent-orange/10 border-accent-orange/20 text-accent-orange',
};

const dotColors = {
    default: 'bg-foreground-subtle',
    success: 'bg-accent-emerald',
    warning: 'bg-accent-amber',
    danger: 'bg-accent-rose',
    info: 'bg-accent-sky',
    orange: 'bg-accent-orange',
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    pulse = false,
    className = '',
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
        >
            {dot && (
                <span className="relative flex h-2 w-2">
                    {pulse && (
                        <span
                            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColors[variant]}`}
                        />
                    )}
                    <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}
                    />
                </span>
            )}
            {children}
        </span>
    );
}

// Status Badge con mapeo de estados predefinidos
type StatusType = 'COMPLETO' | 'INCOMPLETO' | 'PENDIENTE' | 'ACTIVO' | 'INACTIVO' | 'ABIERTO' | 'CERRADO';

interface StatusBadgeProps {
    status: StatusType;
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { variant: BadgeProps['variant']; label: string; dot?: boolean; pulse?: boolean }> = {
    COMPLETO: { variant: 'success', label: 'Completo', dot: true },
    INCOMPLETO: { variant: 'warning', label: 'Incompleto', dot: true },
    PENDIENTE: { variant: 'info', label: 'Pendiente', dot: true, pulse: true },
    ACTIVO: { variant: 'success', label: 'Activo', dot: true },
    INACTIVO: { variant: 'danger', label: 'Inactivo', dot: true },
    ABIERTO: { variant: 'success', label: 'Abierto', dot: true, pulse: true },
    CERRADO: { variant: 'default', label: 'Cerrado', dot: true },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const config = statusConfig[status] || { variant: 'default', label: status };

    return (
        <Badge
            variant={config.variant}
            size={size}
            dot={config.dot}
            pulse={config.pulse}
        >
            {config.label}
        </Badge>
    );
}

// Role Badge
type RoleType = 'admin' | 'registrador' | 'trabajador';

interface RoleBadgeProps {
    role: RoleType;
    size?: 'sm' | 'md' | 'lg';
}

const roleConfig: Record<RoleType, { variant: BadgeProps['variant']; label: string; icon: string }> = {
    admin: { variant: 'orange', label: 'Admin', icon: '👑' },
    registrador: { variant: 'info', label: 'Registrador', icon: '📋' },
    trabajador: { variant: 'default', label: 'Trabajador', icon: '👷' },
};

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const config = roleConfig[role] || { variant: 'default', label: role, icon: '👤' };

    return (
        <Badge variant={config.variant} size={size}>
            <span className="mr-0.5">{config.icon}</span>
            {config.label}
        </Badge>
    );
}

// Count Badge (para notificaciones)
interface CountBadgeProps {
    count: number;
    max?: number;
    variant?: 'orange' | 'danger';
}

export function CountBadge({ count, max = 99, variant = 'orange' }: CountBadgeProps) {
    if (count <= 0) return null;

    const displayCount = count > max ? `${max}+` : count;

    return (
        <span
            className={`
        inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full
        ${variant === 'orange' ? 'bg-accent-orange text-white' : 'bg-accent-rose text-white'}
      `}
        >
            {displayCount}
        </span>
    );
}
