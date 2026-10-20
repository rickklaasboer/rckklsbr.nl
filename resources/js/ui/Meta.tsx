import type { ReactNode } from 'react';
import { cx } from './cx';

/** Muted secondary text: dates, counts, owners. 13px, tabular figures. */
export function Meta({ children, className }: { children: ReactNode; className?: string }) {
    return <span className={cx('meta text-[13px] text-muted', className)}>{children}</span>;
}
