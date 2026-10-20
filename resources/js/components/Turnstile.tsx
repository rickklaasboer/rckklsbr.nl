import { useEffect, useRef } from 'react';

type TurnstileApi = {
    render(container: HTMLElement, options: Record<string, unknown>): string;
    reset(widgetId: string): void;
    remove(widgetId: string): void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
    loading ??= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.addEventListener('load', () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile API missing after load'))));
        script.addEventListener('error', () => {
            loading = null;
            reject(new Error('Turnstile script failed to load'));
        });
        document.head.append(script);
    });

    return loading;
}

// Tokens are single use: bump resetKey after every submit to get a fresh one
export function Turnstile({ siteKey, resetKey, onToken }: { siteKey: string; resetKey: number; onToken: (token: string) => void }) {
    const container = useRef<HTMLDivElement>(null);
    const widget = useRef<string>(undefined);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;

    useEffect(() => {
        let cancelled = false;

        loadTurnstile()
            .then((api) => {
                if (cancelled || !container.current) {
                    return;
                }

                widget.current = api.render(container.current, {
                    sitekey: siteKey,
                    action: 'create-link',
                    theme: 'light',
                    size: 'flexible',
                    callback: (token: string) => onTokenRef.current(token),
                    'expired-callback': () => onTokenRef.current(''),
                    'error-callback': () => console.error('Turnstile widget error'),
                });
            })
            .catch((error) => console.error(error));

        return () => {
            cancelled = true;
            if (widget.current !== undefined) {
                window.turnstile?.remove(widget.current);
                widget.current = undefined;
            }
        };
    }, [siteKey]);

    useEffect(() => {
        if (resetKey > 0 && widget.current !== undefined) {
            window.turnstile?.reset(widget.current);
        }
    }, [resetKey]);

    return <div ref={container} className="md:max-w-[300px]" />;
}
