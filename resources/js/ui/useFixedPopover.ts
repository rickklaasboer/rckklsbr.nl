import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

type Options = {
    // Caps the panel height; the panel then scrolls
    maxHeight?: number;
    // Panel takes the anchor width
    matchWidth?: boolean;
    // Right-aligned panel of this width falls back to the left edge when the anchor sits too close to the viewport's left
    minWidth?: number;
};

// Fixed, not absolute: an ancestor with overflow (modal or sheet dialog) would clip the panel
export function useFixedPopover(
    open: boolean,
    anchor: RefObject<HTMLElement | null>,
    panel: RefObject<HTMLElement | null>,
    align: 'start' | 'end',
    { maxHeight, matchWidth = false, minWidth }: Options = {},
): CSSProperties {
    const [placement, setPlacement] = useState<CSSProperties>({});

    useLayoutEffect(() => {
        if (!open) {
            return;
        }

        const place = () => {
            const rect = anchor.current?.getBoundingClientRect();
            if (!rect || !panel.current) {
                return;
            }
            const viewport = document.documentElement;
            const limit = maxHeight ?? Infinity;
            // Opens upwards when the panel doesn't fit below and there is more room above
            const below = viewport.clientHeight - rect.bottom - 16;
            const above = rect.top - 16;
            const up = Math.min(panel.current.scrollHeight, limit) > below && above > below;
            const vertical: CSSProperties = up
                ? { bottom: viewport.clientHeight - rect.top + 8, ...(maxHeight !== undefined && { maxHeight: Math.min(limit, above) }) }
                : { top: rect.bottom + 8, ...(maxHeight !== undefined && { maxHeight: Math.min(limit, below) }) };
            const right = align === 'end' && (minWidth === undefined || rect.right >= minWidth + 8);
            setPlacement(
                right
                    ? { ...vertical, right: viewport.clientWidth - rect.right }
                    : { ...vertical, left: rect.left, ...(matchWidth && { width: rect.width }) },
            );
        };
        place();
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);

        return () => {
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
        };
    }, [open, anchor, panel, align, maxHeight, matchWidth, minWidth]);

    return placement;
}
