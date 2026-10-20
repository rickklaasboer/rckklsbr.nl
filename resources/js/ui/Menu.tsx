import {
    cloneElement,
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent,
    type MouseEventHandler,
    type ReactElement,
} from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { cx } from './cx';
import { Icon, type IconName } from './Icon';
import { Sheet } from './Sheet';
import { useFixedPopover } from './useFixedPopover';

export type MenuItem =
    | { type: 'separator' }
    | {
          type?: 'item';
          label: string;
          onSelect?: () => void;
          icon?: IconName;
          current?: boolean;
          danger?: boolean;
          // Secondary text at the end of the row
          detail?: string;
      };

type TriggerProps = {
    onClick?: MouseEventHandler;
    'aria-haspopup'?: 'menu';
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
    // Titles the sheet on mobile
    'aria-label'?: string;
};

export function Menu({
    trigger,
    items,
    align = 'end',
    className,
    onOpenChange,
}: {
    trigger: ReactElement<TriggerProps>;
    items: MenuItem[];
    align?: 'start' | 'end';
    className?: string;
    onOpenChange?: (open: boolean) => void;
}) {
    const id = useId();
    const mobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    useEffect(() => {
        onOpenChangeRef.current?.(open);

        return () => onOpenChangeRef.current?.(false);
    }, [open]);
    const root = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const placement = useFixedPopover(open && !mobile, root, panel, align);

    function entries() {
        return Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    }

    function close(restoreFocus: boolean) {
        setOpen(false);
        if (restoreFocus) {
            root.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
        }
    }

    useEffect(() => {
        // The sheet is modal: backdrop, Esc and focus are native
        if (!open || mobile) {
            return;
        }

        const onPointerDown = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        entries()[0]?.focus({ preventScroll: true });

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open, mobile]);

    function onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            close(true);
            return;
        }

        if (event.key === 'Tab') {
            setOpen(false);
            return;
        }

        const list = entries();
        const index = list.indexOf(document.activeElement as HTMLElement);
        const target = {
            ArrowDown: list[(index + 1) % list.length],
            ArrowUp: list[(index - 1 + list.length) % list.length],
            Home: list[0],
            End: list[list.length - 1],
        }[event.key];

        if (target) {
            event.preventDefault();
            target.focus({ preventScroll: true });
        }
    }

    const itemClass = (item: { current?: boolean; danger?: boolean }) =>
        cx(
            'flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] text-left no-underline hover:bg-hover-tint focus-visible:bg-hover-tint',
            mobile ? 'min-h-[52px] px-3 py-3 text-base' : 'px-3.5 py-2.5 text-[15px]',
            item.current ? 'bg-tint font-bold' : 'font-normal',
            item.danger ? 'text-error' : 'text-navy',
        );

    const rows = items.map((item, index) => {
        if (item.type === 'separator') {
            return <div key={index} role="separator" className="h-1.5" />;
        }

        const select = () => {
            item.onSelect?.();
            close(true);
        };

        return (
            <button key={index} type="button" role="menuitem" tabIndex={mobile ? undefined : -1} onClick={select} className={itemClass(item)}>
                {item.icon && <Icon name={item.icon} size={mobile ? 18 : 16} />}
                {item.label}
                {item.detail !== undefined && <span className="meta ml-auto text-sm font-normal text-muted">{item.detail}</span>}
            </button>
        );
    });

    return (
        <div ref={root} className={cx('relative inline-flex', className)}>
            {cloneElement(trigger, {
                onClick: (event) => {
                    trigger.props.onClick?.(event);
                    setOpen((value) => !value);
                },
                'aria-haspopup': 'menu',
                'aria-expanded': open,
                'aria-controls': open ? id : undefined,
            })}
            {open && !mobile && (
                <div
                    ref={panel}
                    id={id}
                    role="menu"
                    onKeyDown={onKeyDown}
                    style={placement}
                    className="anim-alert fixed z-50 w-[220px] rounded-[20px] bg-white p-1.5 shadow-(--shadow-overlay)"
                >
                    {rows}
                </div>
            )}
            {mobile && (
                <Sheet open={open} onClose={() => setOpen(false)} title={trigger.props['aria-label']} contentClassName="px-2 pt-4 pb-7">
                    {open && (
                        <div id={id} role="menu">
                            {rows}
                        </div>
                    )}
                </Sheet>
            )}
        </div>
    );
}
