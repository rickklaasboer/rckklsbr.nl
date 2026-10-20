import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob(['./pages/**/*.tsx', '!./pages/**/*.test.tsx'], { eager: true }) as Record<string, { default: React.ComponentType }>;

const appName = document.querySelector<HTMLMetaElement>('meta[name="application-name"]')?.content;
if (!appName) {
    throw new Error('Missing application-name meta tag');
}

createInertiaApp({
    title: (title) => (title ? `${appName} - ${title}` : appName),
    resolve: (name) => {
        const page = pages[`./pages/${name}.tsx`];
        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
