import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';

export type TextInputProps = {
    label: string;
    error?: string;
    // Sits in the right edge of the field, for example a copy button
    trailing?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ label, error, trailing, className, id, ...rest }: TextInputProps) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;
    const messageId = `${inputId}-message`;

    return (
        <div className={className}>
            <label htmlFor={inputId} className="mb-1.5 block text-sm font-bold text-navy">
                {label}
            </label>
            <div className="relative">
                <input
                    id={inputId}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? messageId : undefined}
                    className={cx(
                        'box-border h-12 w-full rounded-button border bg-white px-5 text-base text-navy outline-none placeholder:text-muted',
                        'focus:shadow-[0_0_0_3px_rgb(36_83_214/0.18)]',
                        error ? 'border-error' : 'border-line focus:border-magenta',
                        !!trailing && 'pr-14',
                    )}
                    {...rest}
                />
                {trailing && <span className="absolute top-0.5 right-0.5 inline-flex">{trailing}</span>}
            </div>
            {error && (
                <div id={messageId} className="mt-1.5 text-[13px] text-error">
                    {error}
                </div>
            )}
        </div>
    );
}
