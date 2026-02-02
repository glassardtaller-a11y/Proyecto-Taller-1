import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-foreground-muted mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              w-full px-4 py-2.5 rounded-lg
              bg-glass border border-glass-border
              text-foreground placeholder-foreground-subtle
              backdrop-blur-xl
              transition-all duration-200
              focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/20' : ''}
              ${className}
            `}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {(error || helperText) && (
                    <p className={`mt-1.5 text-sm ${error ? 'text-accent-rose' : 'text-foreground-subtle'}`}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Select Input
interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-foreground-muted mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`
            w-full px-4 py-2.5 rounded-lg
            bg-glass border border-glass-border
            text-foreground
            backdrop-blur-xl
            transition-all duration-200
            focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/20
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23a1a1aa%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]
            bg-[length:1.5rem] bg-[right_0.5rem_center] bg-no-repeat
            ${error ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/20' : ''}
            ${className}
          `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-background-secondary">
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1.5 text-sm text-accent-rose">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

// Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-foreground-muted mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`
            w-full px-4 py-2.5 rounded-lg
            bg-glass border border-glass-border
            text-foreground placeholder-foreground-subtle
            backdrop-blur-xl
            transition-all duration-200
            focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/20
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${error ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/20' : ''}
            ${className}
          `}
                    {...props}
                />
                {(error || helperText) && (
                    <p className={`mt-1.5 text-sm ${error ? 'text-accent-rose' : 'text-foreground-subtle'}`}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

// Search Input
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
    onClear?: () => void;
}

export function SearchInput({ onClear, value, ...props }: SearchInputProps) {
    return (
        <Input
            type="search"
            leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            }
            rightIcon={
                value && onClear ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="hover:text-foreground transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                ) : undefined
            }
            value={value}
            {...props}
        />
    );
}
