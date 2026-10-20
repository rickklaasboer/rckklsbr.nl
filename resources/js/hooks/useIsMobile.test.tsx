import { act, createContext, useContext, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useIsMobile } from './useIsMobile';

// Browser behavior: every matchMedia() call returns its own list, and each list gets its own change event
const lists: { matches: boolean; listeners: Set<() => void> }[] = [];
let matches = true;

const originalMatchMedia = window.matchMedia;

const Shell = createContext(false);

function Layout({ children }: { children: ReactNode }) {
    const mobile = useIsMobile();

    return mobile ? <Shell.Provider value>{children}</Shell.Provider> : <main>{children}</main>;
}

function MobileOnly() {
    if (!useContext(Shell)) {
        throw new Error('MobileOnly needs the mobile shell.');
    }

    return <p>mobile</p>;
}

function Page() {
    const mobile = useIsMobile();

    return <Layout>{mobile ? <MobileOnly /> : <p>desktop</p>}</Layout>;
}

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
    lists.length = 0;
    matches = true;
    window.matchMedia = () => {
        const list = { matches, listeners: new Set<() => void>() };
        lists.push(list);

        return {
            get matches() {
                return matches;
            },
            addEventListener: (_type: string, listener: () => void) => list.listeners.add(listener),
            removeEventListener: (_type: string, listener: () => void) => list.listeners.delete(listener),
        } as unknown as MediaQueryList;
    };
    container = document.createElement('div');
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    window.matchMedia = originalMatchMedia;
});

it('switches a layout and its page in the same render when the viewport crosses the breakpoint', async () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    act(() => root.render(<Page />));
    expect(container.textContent).toBe('mobile');

    // Outside act so React flushes between events like it does in the browser
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => {
        errors.push(event.error);
        event.preventDefault();
    };
    window.addEventListener('error', onError);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    matches = false;
    for (const list of [...lists]) {
        list.listeners.forEach((listener) => listener());
        await Promise.resolve();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    window.removeEventListener('error', onError);
    consoleError.mockRestore();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

    expect(errors).toEqual([]);
    expect(container.textContent).toBe('desktop');
});
