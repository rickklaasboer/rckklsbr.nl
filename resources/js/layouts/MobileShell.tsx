import type { ReactNode } from 'react';
import { TabBar } from '../components/TabBar';

// Plain grid: content scrolls in the middle row, the tab bar is the footer
export function MobileShell({ children }: { children: ReactNode }) {
    return (
        <div className="grid h-dvh grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-ground text-ink">
            <main className="relative flex min-h-0 min-w-0 flex-col">{children}</main>
            <TabBar />
        </div>
    );
}
