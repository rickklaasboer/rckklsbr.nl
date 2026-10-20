import type { ReactNode } from 'react';
import { cx } from './cx';
import { Icon } from './Icon';

const tones = {
    info: 'bg-info-bg text-info',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    error: 'bg-error-bg text-error',
};

export function Alert({
    tone = 'info',
    title,
    role = 'alert',
    children,
    className,
}: {
    tone?: keyof typeof tones;
    title: string;
    role?: 'alert' | 'status';
    children?: ReactNode;
    className?: string;
}) {
    return (
        <div role={role} className={cx('anim-alert flex gap-3.5 rounded-panel px-5 py-[18px]', tones[tone], className)}>
            <Icon name="info" size={20} className="mt-px shrink-0" />
            <div>
                <div className="text-base font-extrabold">{title}</div>
                {children && <div className="mt-0.5 text-[15px] text-navy">{children}</div>}
            </div>
        </div>
    );
}
