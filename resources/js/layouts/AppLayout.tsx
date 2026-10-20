import { Head, usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useIsMobile } from '../hooks/useIsMobile';
import { t } from '../i18n';
import type { SharedProps } from '../types';
import { ToastHost, useToast } from '../ui';
import { MobileShell } from './MobileShell';

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
    const toast = useToast();
    const mobile = useIsMobile();
    const { success, error } = usePage<SharedProps>().props.flash;

    useEffect(() => {
        if (success !== null) {
            toast.show({ kind: 'success', title: success });
        }
    }, [success, toast]);

    useEffect(() => {
        if (error !== null) {
            toast.show({ kind: 'error', title: t('Something went wrong'), body: error });
        }
    }, [error, toast]);

    return (
        <>
            <Head title={title} />
            {mobile ? (
                <MobileShell>{children}</MobileShell>
            ) : (
                <div className="flex h-dvh overflow-hidden bg-ground text-ink">
                    <Sidebar />
                    <main className="relative flex min-w-0 flex-1 flex-col">{children}</main>
                </div>
            )}
            <ToastHost />
        </>
    );
}
