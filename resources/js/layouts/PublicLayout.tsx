import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHero } from '../components/SiteHero';
import { ToastHost } from '../ui';

export function PublicLayout({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col bg-surface text-ink">
            <Head title={title} />
            <main className="flex-1">
                <SiteHero />
                {children}
            </main>
            <SiteFooter />
            <ToastHost />
        </div>
    );
}
