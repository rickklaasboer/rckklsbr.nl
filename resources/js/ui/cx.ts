export function cx(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(' ');
}

// Ring for a custom control that sits next to a visually hidden native input (`peer`)
export const PEER_RING = 'peer-focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_5px_var(--color-navy)]';
