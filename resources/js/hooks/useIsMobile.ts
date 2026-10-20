import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 767px)';

// One shared list: separate lists each fire their own change event and React renders in between,
// so a layout could switch while its page still passes the other branch's children.
const listeners = new Set<() => void>();
let media: MediaQueryList | null = null;

function notify() {
    listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
    if (media === null) {
        media = window.matchMedia(QUERY);
        media.addEventListener('change', notify);
    }
    listeners.add(onChange);

    return () => {
        listeners.delete(onChange);
        if (listeners.size === 0 && media !== null) {
            media.removeEventListener('change', notify);
            media = null;
        }
    };
}

export function useIsMobile(): boolean {
    return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches);
}
