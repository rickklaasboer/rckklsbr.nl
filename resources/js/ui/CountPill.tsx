import { cx } from './cx';

const TONES = {
    white: 'bg-white text-muted',
    magenta: 'bg-magenta text-white',
};

export function CountPill({ count, tone = 'white' }: { count: number; tone?: keyof typeof TONES }) {
    return <span className={cx('rounded-full px-2 meta text-xs leading-5', TONES[tone])}>{count}</span>;
}
