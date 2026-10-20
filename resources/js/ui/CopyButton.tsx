import { useEffect, useRef, useState } from 'react';
import { t } from '../i18n';
import { cx } from './cx';
import { Icon } from './Icon';
import { useToast } from './Toast';

const COPIED_MS = 2000;

export function CopyButton({
    text,
    label,
    mono = false,
    iconOnly = false,
    className,
}: {
    text: string;
    label: string;
    // Mono 13px label for values such as branch names; the copied state stays the regular label
    mono?: boolean;
    // 44px square target with the label as aria-label; className sets shape and background
    iconOnly?: boolean;
    className?: string;
}) {
    const toast = useToast();
    const [copied, setCopied] = useState(false);
    const timer = useRef(0);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Copy to clipboard failed', error);
            toast.show({ kind: 'error', title: t('Copy failed') });
            return;
        }

        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    }

    if (iconOnly) {
        return (
            <button
                type="button"
                onClick={copy}
                aria-label={copied ? t('Copied') : label}
                className={cx(
                    'anim-zoom box-border inline-flex size-11 shrink-0 cursor-pointer items-center justify-center border-0 p-0',
                    copied ? 'text-success' : 'text-navy',
                    className,
                )}
            >
                <Icon name={copied ? 'check' : 'copy'} size={copied ? 14 : 16} />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={copy}
            className={cx(
                'anim-press box-border inline-flex h-9 max-w-full cursor-pointer items-center gap-2 rounded-button px-4 leading-none',
                mono && !copied ? 'font-mono text-[13px] font-medium' : 'text-sm font-bold',
                copied ? 'bg-success-bg text-success' : 'bg-white text-navy hover:bg-hover-tint',
                className,
            )}
        >
            <Icon name={copied ? 'check' : 'copy'} size={copied ? 14 : 16} />
            <span aria-live="polite" className="truncate">{copied ? t('Copied') : label}</span>
        </button>
    );
}
