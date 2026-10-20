import { Link, usePage } from '@inertiajs/react';
import { t } from '../i18n';
import { onPath } from '../lib/nav';
import { cx, Icon, type IconName } from '../ui';
import { ProfileMenu } from './ProfileMenu';

const row = 'anim-fade box-border flex h-11 w-full shrink-0 items-center gap-2.5 rounded-button px-3.5 text-[15px] font-bold text-white no-underline';

const NAV: { href: string; icon: IconName; label: string }[] = [
    { href: '/links', icon: 'link', label: 'Links' },
    { href: '/', icon: 'plus', label: 'New link' },
];

export function Sidebar() {
    const { url } = usePage();

    return (
        <aside aria-label={t('Sidebar')} className="on-dark box-border flex w-[264px] shrink-0 flex-col gap-[22px] bg-navy p-3.5">
            <nav aria-label={t('Main')} className="flex flex-col gap-0.5">
                {NAV.map(({ href, icon, label }) => {
                    // The public page is not part of the admin: only /links can be current here
                    const current = href !== '/' && onPath(url, href);

                    return (
                        <Link key={href} href={href} aria-current={current ? 'page' : undefined} className={cx(row, current ? 'bg-white/14' : 'hover:bg-white/8')}>
                            <Icon name={icon} size={16} />
                            <span className="flex-1">{t(label)}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto">
                <ProfileMenu />
            </div>
        </aside>
    );
}
