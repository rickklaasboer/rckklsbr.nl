import type { ReactNode } from 'react';
import { CountPill } from './CountPill';
import { cx } from './cx';

const ROW_BASE = 'flex items-center gap-3 rounded-card px-3.5 py-3 no-underline shadow-row transition-colors';
const ROW_HOVER = 'hover:bg-hover-tint';

// Static rows have no hover; only rows that navigate or act use the _LINK variants
export const WELL_ROW = `${ROW_BASE} bg-white`;
export const WELL_ROW_LINK = `${WELL_ROW} ${ROW_HOVER}`;
// Done or read rows; own constants because cx cannot resolve two background utilities
export const WELL_ROW_MUTED = `${ROW_BASE} bg-white/55`;
export const WELL_ROW_MUTED_LINK = `${WELL_ROW_MUTED} ${ROW_HOVER}`;

export function Well({
    title,
    count,
    badge,
    leading,
    actions,
    label,
    className,
    bodyClassName,
    children,
}: {
    title?: ReactNode;
    count?: number;
    badge?: ReactNode;
    leading?: ReactNode;
    actions?: ReactNode;
    label?: string;
    className?: string;
    bodyClassName?: string;
    children: ReactNode;
}) {
    return (
        <section aria-label={label} className={cx('flex flex-col gap-2 rounded-well-lg bg-well p-2.5', className)}>
            {title && (
                <header className="flex items-center gap-2 px-1.5 pt-1">
                    {leading}
                    <h2 className="m-0 text-base font-extrabold tracking-[-0.02em] text-navy">{title}</h2>
                    {count !== undefined && <CountPill count={count} />}
                    {badge}
                    <span className="flex-1" />
                    {actions}
                </header>
            )}
            <div className={cx('flex flex-col gap-2', bodyClassName)}>{children}</div>
        </section>
    );
}
