import type { ReactNode } from 'react';
import { cx } from './cx';

export function Eyebrow({
    children,
    as: Tag = 'h2',
    onDark = false,
    id,
    className,
}: {
    children: ReactNode;
    as?: 'h2' | 'h3' | 'p' | 'span';
    onDark?: boolean;
    id?: string;
    className?: string;
}) {
    return (
        <Tag
            id={id}
            className={cx('m-0 text-xs uppercase tracking-[0.08em]', onDark ? 'font-bold text-white/50' : 'font-extrabold text-muted', className)}
        >
            {children}
        </Tag>
    );
}
