import translations from '../../lang/nl.json';

const dictionary: Record<string, string> = translations;

export function t(key: string, replace: Record<string, string | number> = {}): string {
    if (!Object.hasOwn(dictionary, key)) {
        throw new Error(`Missing translation: ${key}`);
    }

    // Longest names first, like Laravel, so :counter is not clobbered by :count
    const replacements = Object.entries(replace).sort(([a], [b]) => b.length - a.length);

    return replacements.reduce(
        (text, [name, replacement]) => text.replaceAll(`:${name}`, String(replacement)),
        dictionary[key],
    );
}
