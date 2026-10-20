import { Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { t } from '../i18n';
import { onPath } from '../lib/nav';
import type { SharedProps } from '../types';
import { Avatar, cx, Icon, Menu, type IconName } from '../ui';

const item =
    'box-border flex min-h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-0 bg-transparent p-0 text-[11px] font-bold tracking-[-0.01em] whitespace-nowrap no-underline active:opacity-60';

function Label({ current, children }: { current: boolean; children: ReactNode }) {
    return <span className={cx(current && 'font-extrabold')}>{children}</span>;
}

function Tab({ href, icon, label, current }: { href: string; icon: IconName; label: string; current: boolean }) {
    return (
        <Link href={href} aria-current={current ? 'page' : undefined} className={cx(item, current ? 'text-navy' : 'text-muted')}>
            <Icon name={icon} size={22} />
            <Label current={current}>{label}</Label>
        </Link>
    );
}

export function TabBar() {
    const { url, props } = usePage<SharedProps>();
    const security = onPath(url, '/settings');

    return (
        <nav aria-label={t('Main')} className="box-border flex shrink-0 border-t border-line bg-white px-2 pt-1.5 pb-[22px]">
            <Tab href="/links" icon="link" label={t('Links')} current={onPath(url, '/links')} />
            <Tab href="/" icon="plus" label={t('New link')} current={false} />
            <Menu
                className="min-w-0 flex-1"
                items={[
                    { label: t('Security'), onSelect: () => router.visit('/settings/security') },
                    { type: 'separator' },
                    { label: t('Log out'), danger: true, onSelect: () => router.post('/logout') },
                ]}
                trigger={
                    <button type="button" aria-label={t('More')} className={cx(item, 'w-full', security ? 'text-navy' : 'text-muted')}>
                        <Avatar name={props.auth.user.name} />
                        <Label current={security}>{t('More')}</Label>
                    </button>
                }
            />
        </nav>
    );
}
