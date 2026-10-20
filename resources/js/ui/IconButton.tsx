import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';
import { Icon, type IconName } from './Icon';

export type IconButtonVariant = 'gradient' | 'navy' | 'light' | 'default' | 'subtle' | 'tint' | 'white';
export type IconButtonSize = 36 | 44 | 56;

const variants: Record<IconButtonVariant, string> = {
    gradient: 'bg-(image:--gradient-accent-icon) text-white',
    navy: 'bg-navy text-white toolbar:bg-magenta',
    light: 'bg-magenta-tint text-magenta-ink',
    default: 'bg-tint text-navy hover:bg-hover-tint toolbar:bg-white/10 toolbar:text-white toolbar:hover:bg-white/14',
    subtle: 'bg-transparent text-navy hover:bg-hover-tint toolbar:text-white toolbar:hover:bg-white/10',
    tint: 'bg-tint text-navy',
    white: 'bg-white text-navy hover:bg-hover-tint toolbar:bg-transparent toolbar:text-white toolbar:hover:bg-white/10',
};

const iconSizes: Record<IconButtonSize, number> = { 36: 14, 44: 16, 56: 20 };

export type IconButtonProps = {
    icon: IconName;
    label: string;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'>;

export function IconButton({ icon, label, variant = 'default', size = 44, className, type = 'button', ...rest }: IconButtonProps) {
    return (
        <button
            type={type}
            aria-label={label}
            style={{ width: size, height: size }}
            className={cx(
                'anim-zoom box-border inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0 disabled:cursor-not-allowed disabled:opacity-50',
                variants[variant],
                className,
            )}
            {...rest}
        >
            <Icon name={icon} size={iconSizes[size]} />
        </button>
    );
}
