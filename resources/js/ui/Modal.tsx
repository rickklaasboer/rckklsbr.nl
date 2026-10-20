import { useEffect, useRef, type ReactNode } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { cx } from './cx';

export type ModalProps = {
    open: boolean;
    onClose: () => void;
    labelledBy: string;
    width?: number;
    fullScreen?: boolean;
    padded?: boolean;
    // Pins the dialog this far from the top instead of centering it vertically
    top?: string;
    children: ReactNode;
};

export function Modal({ open, onClose, labelledBy, width = 440, fullScreen = false, padded = !fullScreen, top, children }: ModalProps) {
    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const element = dialog.current;
        if (!element) {
            return;
        }

        if (open && !element.open) {
            element.showModal();
        } else if (!open && element.open) {
            element.close();
        }
    }, [open]);

    // Bottom sheet styling (base.css dialog[data-sheet]) instead of the centered card
    const sheet = useIsMobile() && !fullScreen;

    return (
        <dialog
            ref={dialog}
            {...(sheet ? { 'data-sheet': true } : { 'data-modal': true })}
            aria-labelledby={labelledBy}
            // Native close covers Esc and backdrop click; skip the echo of a close the parent asked for
            // React bubbles close from nested dialogs (picker sheets) through its tree: only react to our own
            onClose={(event) => event.target === event.currentTarget && open && onClose()}
            onClick={(event) => event.target === dialog.current && dialog.current?.close()}
            style={fullScreen || sheet ? undefined : { width, ...(top === undefined ? {} : { marginTop: top, marginBottom: 'auto' }) }}
            className={cx(
                'box-border overflow-auto bg-white p-0 text-ink',
                sheet
                    ? 'm-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-modal rounded-b-none'
                    : fullScreen
                      ? 'm-auto h-dvh max-h-none w-screen max-w-none rounded-none'
                      : 'm-auto max-h-[calc(100dvh-48px)] max-w-[calc(100vw-32px)] rounded-modal shadow-[0_24px_48px_rgb(18_19_22/0.25)]',
            )}
        >
            {sheet && <div aria-hidden="true" className="mx-auto mt-3 h-1 w-10 rounded-full bg-line" />}
            <div className={cx(padded && (sheet ? 'px-5 pt-4 pb-7' : 'p-7'), fullScreen && 'h-full')}>{children}</div>
        </dialog>
    );
}
