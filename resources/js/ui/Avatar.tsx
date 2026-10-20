import { cx } from './cx';

function initials(name: string): string {
    const words = name.trim().split(/\s+/);

    return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2)).toUpperCase();
}

export function Avatar({ name, size = 22 }: { name: string; size?: 22 | 40 }) {
    return (
        <span
            role="img"
            aria-label={name}
            style={{ width: size, height: size }}
            className={cx('inline-flex shrink-0 items-center justify-center rounded-full bg-magenta font-extrabold text-white', size === 22 ? 'text-[10px]' : 'text-sm')}
        >
            {initials(name)}
        </span>
    );
}
