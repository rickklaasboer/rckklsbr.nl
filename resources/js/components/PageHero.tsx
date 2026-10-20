import type { ReactNode } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { cx } from '../ui/cx';

export function PageHero({
    title,
    badge,
    toolbar,
    trailing,
    footer,
    className,
}: {
    title: ReactNode;
    badge?: ReactNode;
    toolbar?: ReactNode;
    trailing?: ReactNode;
    // Row under the title, for stats that do not fit beside it on mobile
    footer?: ReactNode;
    className?: string;
}) {
    const mobile = useIsMobile();

    return (
        <header
            className={cx(
                'flex shrink-0 flex-col bg-navy bg-(image:--gradient-hero-wash)',
                mobile
                    ? cx('gap-5 px-2.5 pb-5', toolbar ? 'pt-2.5' : 'pt-5')
                    : cx('gap-8 px-3 pb-7', toolbar ? 'pt-3' : 'pt-7'),
                className,
            )}
        >
            {toolbar && (
                <div data-hero-toolbar className="on-dark flex flex-wrap items-center gap-1.5 rounded-bar p-1.5 text-white">
                    {toolbar}
                </div>
            )}
            <div className={cx('flex items-center gap-3.5', mobile ? 'px-2' : 'px-[18px]')}>
                <h1
                    className={cx(
                        // truncate clips at the padding box; leading-none puts descenders outside it
                        '-my-[0.2em] min-w-0 truncate py-[0.2em] leading-none font-extrabold tracking-[-0.035em] text-white',
                        mobile ? 'text-[30px]' : 'text-[44px]',
                    )}
                >
                    {title}
                </h1>
                {badge}
                <span className="flex-1" />
                {trailing}
            </div>
            {footer && <div className={cx('flex flex-wrap gap-x-7 gap-y-3', mobile ? 'px-2' : 'px-[18px]')}>{footer}</div>}
        </header>
    );
}
