import { t } from '../i18n';
import { plural } from './plural';

const dateFormat = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

const HOUR_MS = 3_600_000;

// nl-NL abbreviates with a trailing dot: '20 okt. 2026'
export function formatDate(iso: string): string {
    return dateFormat.format(new Date(iso)).replace('.', '');
}

function sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** '2 uur geleden', 'gisteren' or a date */
export function timeAgo(iso: string, now: Date = new Date()): string {
    const date = new Date(iso);
    const elapsed = now.getTime() - date.getTime();

    if (elapsed < 60_000) {
        return t('just now');
    }
    if (elapsed < HOUR_MS) {
        return plural(Math.floor(elapsed / 60_000), ':count minute ago', ':count minutes ago');
    }
    if (elapsed < 24 * HOUR_MS) {
        return plural(Math.floor(elapsed / HOUR_MS), ':count hour ago', ':count hours ago');
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    return sameDay(date, yesterday) ? t('yesterday') : formatDate(iso);
}
