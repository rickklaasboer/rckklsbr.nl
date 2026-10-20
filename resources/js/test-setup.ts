// jsdom has no matchMedia; useIsMobile needs it. Desktop unless a test mocks the hook.
if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string) =>
        ({
            matches: false,
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
        }) as unknown as MediaQueryList;
}
