import type { ReactNode } from 'react';
import { PageHero } from '../components/PageHero';
import { useIsMobile } from '../hooks/useIsMobile';
import { AppLayout } from './AppLayout';

export function SettingsLayout({ title, children }: { title: string; children: ReactNode }) {
    const mobile = useIsMobile();

    return (
        <AppLayout title={title}>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-10">
                <PageHero title={title} />
                <div className={mobile ? 'w-full min-w-0 px-4 pt-4' : 'w-full max-w-[1480px] min-w-0 px-[30px] pt-6'}>{children}</div>
            </div>
        </AppLayout>
    );
}
