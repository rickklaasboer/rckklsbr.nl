import type { InputHTMLAttributes } from 'react';
import { cx, PEER_RING } from './cx';
import { Icon } from './Icon';

export type CheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'>;

export function Checkbox({ checked, onChange, label, className, disabled, ...rest }: CheckboxProps) {
    return (
        <label
            className={cx(
                'flex min-h-11 items-center gap-3 text-base text-navy',
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                className,
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
                className="peer sr-only"
                {...rest}
            />
            <span
                aria-hidden="true"
                className={cx(
                    'inline-flex size-[22px] shrink-0 items-center justify-center rounded-md',
                    checked ? 'bg-(image:--gradient-accent) text-white' : 'border-[1.5px] border-control-border bg-white',
                    PEER_RING,
                )}
            >
                {checked && <Icon name="check" size={13} />}
            </span>
            {label}
        </label>
    );
}
