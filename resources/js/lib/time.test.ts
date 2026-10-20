import { describe, expect, it } from 'vitest';
import { formatDate, timeAgo } from './time';

const now = new Date('2026-10-20T12:00:00');

describe('formatDate', () => {
    it('drops the dot after the month abbreviation', () => {
        expect(formatDate('2026-10-20T09:00:00')).toBe('20 okt 2026');
    });
});

describe('timeAgo', () => {
    it.each([
        ['2026-10-20T11:59:40', 'zojuist'],
        ['2026-10-20T11:15:00', '45 minuten geleden'],
        ['2026-10-20T10:00:00', '2 uur geleden'],
        ['2026-10-19T09:00:00', 'gisteren'],
        ['2026-10-06T09:00:00', '6 okt 2026'],
    ])('%s becomes %s', (iso, expected) => {
        expect(timeAgo(iso, now)).toBe(expected);
    });
});
