import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../i18n';
import { cx } from './cx';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Meta } from './Meta';

export type ToastInput = { title: string; body?: ReactNode; kind: 'success' | 'error' };
type ToastItem = ToastInput & { id: number };

const AUTO_DISMISS_MS = 6000;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function publish(next: ToastItem[]) {
    toasts = next;
    listeners.forEach((listener) => listener());
}

function dismiss(id: number) {
    publish(toasts.filter((toast) => toast.id !== id));
}

function show(input: ToastInput) {
    const id = nextId++;
    publish([...toasts, { ...input, id }]);

    // Errors stay until closed
    if (input.kind === 'success') {
        window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    }
}

const api = { show };

export function useToast() {
    return api;
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

// A modal dialog makes everything outside it inert, so the host lives inside the topmost open one
function topmostModal(): HTMLElement {
    const open = document.querySelectorAll<HTMLElement>('dialog[open]:modal');

    return open.length > 0 ? open[open.length - 1] : document.body;
}

export function ToastHost() {
    const items = useSyncExternalStore(subscribe, () => toasts);
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const host = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const update = () => setContainer(topmostModal());
        update();
        const observer = new MutationObserver(update);
        // childList: a dialog unmounted while open changes no attribute, but its toast host goes with it
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });

        return () => observer.disconnect();
    }, []);

    // Popover goes to the top layer; re-showing after each change keeps it above newer dialogs
    useEffect(() => {
        const element = host.current;
        if (!element) {
            return;
        }

        if (element.matches(':popover-open')) {
            element.hidePopover();
        }
        // Detached when its dialog just unmounted; the observer then moves the host to a live container
        if (items.length > 0 && element.isConnected) {
            element.showPopover();
        }
    }, [container, items.length]);

    if (!container) {
        return null;
    }

    return createPortal(
        <div
            ref={host}
            popover="manual"
            className="pointer-events-none fixed inset-auto right-4 bottom-4 left-4 m-0 flex flex-col gap-3 overflow-visible border-0 bg-transparent p-0 md:right-auto md:bottom-6 md:left-6 md:w-[380px]"
        >
            {items.map((toast) => (
                <div
                    key={toast.id}
                    role={toast.kind === 'error' ? 'alert' : 'status'}
                    className="anim-toast pointer-events-auto box-border flex items-start gap-3.5 rounded-button bg-white py-4 pr-4 pl-5 shadow-(--shadow-overlay)"
                >
                    <span
                        className={cx(
                            'anim-pop inline-flex size-8 shrink-0 items-center justify-center rounded-full',
                            toast.kind === 'success' ? 'bg-success-bg text-success' : 'bg-error-bg text-error',
                        )}
                    >
                        <Icon name={toast.kind === 'success' ? 'check' : 'info'} size={16} />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                        <div className="text-[15px] font-extrabold text-navy">{toast.title}</div>
                        {toast.body && <Meta className="mt-0.5 block">{toast.body}</Meta>}
                    </div>
                    <IconButton
                        icon="close"
                        label={t('Close')}
                        variant="subtle"
                        size={36}
                        className="-my-1 -mr-2 text-muted"
                        onClick={() => dismiss(toast.id)}
                    />
                </div>
            ))}
        </div>,
        container,
    );
}
