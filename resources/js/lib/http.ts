export class HttpError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly errors: Record<string, string[]>,
    ) {
        super(message);
    }
}

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    if (!match) {
        throw new Error('XSRF-TOKEN cookie is missing');
    }

    return decodeURIComponent(match[1]);
}

export async function http<T = unknown>(method: string, url: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    // FormData: the browser sets the multipart Content-Type with its boundary
    const multipart = body instanceof FormData;
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        signal,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
            ...(body === undefined || multipart ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
    });

    const text = await response.text();
    // Proxy errors (413, 502) answer with HTML; keep the status text instead of a parse error
    const json = response.headers.get('Content-Type')?.includes('json') === true;
    const data = text === '' || !json ? null : JSON.parse(text);

    if (response.ok && text !== '' && !json) {
        throw new Error(`Expected JSON from ${method} ${url}`);
    }

    if (!response.ok) {
        throw new HttpError(data?.message ?? (response.statusText || `HTTP ${response.status}`), response.status, data?.errors ?? {});
    }

    return data as T;
}
