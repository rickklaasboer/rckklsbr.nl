import type { ReactNode } from 'react';

export type IconName = 'plus' | 'check' | 'chevron-up' | 'close' | 'copy' | 'link' | 'arrow-up-right' | 'info' | 'trash';

// 24px grid; stroke width differs per icon
const icons: Record<IconName, { stroke: number; paths: ReactNode }> = {
    plus: { stroke: 3, paths: <path d="M12 5v14M5 12h14" /> },
    check: { stroke: 3, paths: <path d="m5 12 5 5 9-10" /> },
    'chevron-up': { stroke: 2.6, paths: <path d="M6 15l6-6 6 6" /> },
    close: { stroke: 2.4, paths: <path d="M6 6l12 12M18 6 6 18" /> },
    copy: {
        stroke: 2,
        paths: (
            <>
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
            </>
        ),
    },
    link: {
        stroke: 2.2,
        paths: (
            <>
                <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
                <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
            </>
        ),
    },
    'arrow-up-right': { stroke: 3, paths: <path d="M7 17 17 7M8 7h9v9" /> },
    info: {
        stroke: 2.2,
        paths: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
            </>
        ),
    },
    trash: { stroke: 2, paths: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /> },
};

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
    const { stroke, paths } = icons[name];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={className}
        >
            {paths}
        </svg>
    );
}
