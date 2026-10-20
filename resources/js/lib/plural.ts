import { t } from '../i18n';

export function plural(count: number, one: string, many: string, replace: Record<string, string | number> = {}): string {
    return t(count === 1 ? one : many, { count, ...replace });
}
