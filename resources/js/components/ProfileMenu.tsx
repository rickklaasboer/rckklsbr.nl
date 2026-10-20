import { router, usePage } from '@inertiajs/react';
import { t } from '../i18n';
import type { SharedProps } from '../types';
import { Avatar, Icon, Menu } from '../ui';

export function ProfileMenu() {
    const { auth } = usePage<SharedProps>().props;

    return (
        <Menu
            align="start"
            className="flex w-full"
            items={[
                { label: t('Security'), onSelect: () => router.visit('/settings/security') },
                { type: 'separator' },
                { label: t('Log out'), danger: true, onSelect: () => router.post('/logout') },
            ]}
            trigger={
                <button
                    type="button"
                    className="anim-fade box-border flex h-12 w-full cursor-pointer items-center gap-2.5 rounded-button border-0 bg-white/8 px-3.5 text-left text-sm font-bold text-white hover:bg-white/14"
                >
                    <Avatar name={auth.user.name} size={22} />
                    <span className="min-w-0 flex-1 truncate">{auth.user.name}</span>
                    <Icon name="chevron-up" size={14} />
                </button>
            }
        />
    );
}
