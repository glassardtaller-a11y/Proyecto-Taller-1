import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glow?: 'orange' | 'emerald' | 'violet' | 'none';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

const glowClasses = {
    none: '',
    orange: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]',
    emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    violet: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
};

export function Card({
    children,
    className = '',
    hover = true,
    glow = 'none',
    padding = 'lg',
}: CardProps) {
    return (
        <div
            className={`
        bg-glass backdrop-blur-xl border border-glass-border rounded-xl
        ${paddingClasses[padding]}
        ${hover ? 'transition-all duration-200 hover:bg-glass-hover hover:border-glass-border-hover hover:-translate-y-0.5' : ''}
        ${glowClasses[glow]}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className = '', as: Tag = 'h3' }: CardTitleProps) {
    return (
        <Tag className={`text-lg font-semibold text-foreground ${className}`}>
            {children}
        </Tag>
    );
}

interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
    return (
        <p className={`text-sm text-foreground-muted mt-1 ${className}`}>
            {children}
        </p>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`mt-4 pt-4 border-t border-glass-border ${className}`}>
            {children}
        </div>
    );
}

// Stat Card para KPIs del Dashboard
interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    accentColor?: 'orange' | 'emerald' | 'violet' | 'sky' | 'rose';
}

const accentBorderClasses = {
    orange: 'border-l-accent-orange',
    emerald: 'border-l-accent-emerald',
    violet: 'border-l-accent-violet',
    sky: 'border-l-accent-sky',
    rose: 'border-l-accent-rose',
};

const accentBgClasses = {
    orange: 'bg-accent-orange/10 text-accent-orange',
    emerald: 'bg-accent-emerald/10 text-accent-emerald',
    violet: 'bg-accent-violet/10 text-accent-violet',
    sky: 'bg-accent-sky/10 text-accent-sky',
    rose: 'bg-accent-rose/10 text-accent-rose',
};

export function StatCard({
    title,
    value,
    description,
    icon,
    trend,
    accentColor = 'orange',
}: StatCardProps) {
    return (
        <Card
            className={`border-l-4 ${accentBorderClasses[accentColor]}`}
            glow={accentColor as 'orange' | 'emerald' | 'violet' | 'none'}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground-muted">{title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                    {description && (
                        <p className="text-xs text-foreground-subtle mt-1">{description}</p>
                    )}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-foreground-subtle">vs anterior</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-lg ${accentBgClasses[accentColor]}`}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}
