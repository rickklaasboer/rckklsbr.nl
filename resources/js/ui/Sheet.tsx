import { useEffect, useId, useRef, type ReactNode } from 'react';

export type SheetProps = {
    open: boolean;
    onClose: () => void;
    labelledBy?: string;
    // Renders a left-aligned header and labels the dialog with it
    title?: string;
    // Replaces the default content padding
    contentClassName?: string;
    children: ReactNode;
};

export function Sheet({ open, onClose, labelledBy, title, contentClassName = 'px-5 pt-4 pb-7', children }: SheetProps) {
    const dialog = useRef<HTMLDialogElement>(null);
    const titleId = useId();

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

    return (
        <dialog
            ref={dialog}
            data-sheet
            aria-labelledby={title === undefined ? labelledBy : titleId}
            // React bubbles close from nested dialogs through its tree: only react to our own
            onClose={(event) => event.target === event.currentTarget && open && onClose()}
            onClick={(event) => event.target === dialog.current && dialog.current?.close()}
            className="m-0 mt-auto box-border max-h-[85dvh] w-full max-w-none overflow-auto rounded-t-modal rounded-b-none bg-white p-0 text-ink"
        >
            <div aria-hidden="true" className="mx-auto mt-3 h-1 w-10 rounded-full bg-line" />
            <div className={contentClassName}>
                {title !== undefined && (
                    <h2 id={titleId} className="m-0 mb-2 px-3 text-[17px] leading-6 font-extrabold text-navy">
                        {title}
                    </h2>
                )}
                {children}
            </div>
        </dialog>
    );
}
