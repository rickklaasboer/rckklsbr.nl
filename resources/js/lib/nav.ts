// True when the page url is the prefix itself or below it
export function onPath(url: string, prefix: string): boolean {
    const path = url.split('?')[0];

    return path === prefix || path.startsWith(`${prefix}/`);
}
