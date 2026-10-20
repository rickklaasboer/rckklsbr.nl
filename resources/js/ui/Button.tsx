import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'navy' | 'light' | 'outline' | 'secondary' | 'default' | 'subtle';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const sizes: Record<ButtonSize, { box: string; icon: number }> = {
    xs: { box: 'h-[30px] gap-1.5 px-3.5 text-[13px]', icon: 12 },
    sm: { box: 'h-9 gap-2 px-4 text-sm', icon: 14 },
    md: { box: 'h-11 gap-2 px-5 text-[15px]', icon: 14 },
    lg: { box: 'h-[54px] gap-2.5 px-7 text-[17px]', icon: 16 },
};

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-(image:--gradient-accent) text-white',
    navy: 'bg-navy text-white toolbar:bg-magenta',
    light: 'bg-magenta-tint text-magenta-ink',
    outline: 'border-[1.5px] border-navy bg-transparent text-navy hover:bg-tint toolbar:border-white toolbar:text-white toolbar:hover:bg-white/10',
    secondary: 'border-2 border-magenta bg-white text-magenta-ink hover:bg-magenta-tint toolbar:border-white/55 toolbar:bg-transparent toolbar:text-white toolbar:hover:bg-white/10',
    default: 'bg-tint text-navy hover:bg-hover-tint toolbar:bg-white/10 toolbar:text-white toolbar:hover:bg-white/14',
    subtle: 'bg-transparent text-navy hover:bg-hover-tint toolbar:text-white toolbar:hover:bg-white/10',
};

/** Button styling for non-button elements such as Inertia links. */
const BASE = 'anim-press box-border inline-flex shrink-0 items-center justify-center rounded-button font-bold leading-none';

export function buttonClass(variant: ButtonVariant, size: ButtonSize = 'md'): string {
    return cx(BASE, 'cursor-pointer no-underline', sizes[size].box, variants[variant]);
}

export type ButtonProps = {
    variant: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: IconName;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
    variant,
    size = 'md',
    loading = false,
    icon,
    className,
    disabled,
    type = 'button',
    children,
    ...rest
}: ButtonProps) {
    const { box, icon: iconSize } = sizes[size];

    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={cx(
                BASE,
                box,
                disabled ? 'cursor-not-allowed bg-tint text-disabled' : variants[variant],
                !disabled && (loading ? 'cursor-progress opacity-85' : 'cursor-pointer'),
                className,
            )}
            {...rest}
        >
            {loading ? (
                <span
                    aria-hidden="true"
                    style={{ width: iconSize, height: iconSize }}
                    className="animate-spin rounded-full border-2 border-current/40 border-t-current"
                />
            ) : (
                icon && <Icon name={icon} size={iconSize} />
            )}
            {children}
        </button>
    );
}
