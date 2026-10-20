import { router } from '@inertiajs/react';
import { useState } from 'react';
import { PageHero } from '../../components/PageHero';
import { useIsMobile } from '../../hooks/useIsMobile';
import { t } from '../../i18n';
import { AppLayout } from '../../layouts/AppLayout';
import { plural } from '../../lib/plural';
import { formatDate, timeAgo } from '../../lib/time';
import type { LinkRow } from '../../types';
import { Button, CopyButton, CountPill, cx, IconButton, Modal, Well, WELL_ROW } from '../../ui';

const meta = 'text-[13px] text-muted tabular-nums';

function Row({ link, onDelete }: { link: LinkRow; onDelete: () => void }) {
    return (
        <li className={WELL_ROW}>
            <div className="flex min-w-0 flex-1 flex-col xl:flex-row xl:items-center xl:gap-3">
                <a href={link.url} target="_blank" rel="noreferrer" className="font-mono text-[15px] font-bold text-navy no-underline hover:underline xl:w-28 xl:shrink-0">
                    {link.code}
                </a>
                <span title={link.destination} className="min-w-0 truncate text-[15px] text-ink xl:flex-1">
                    {link.destination}
                </span>
                <div className="flex flex-wrap gap-x-1.5 xl:contents">
                    <span className={cx(meta, 'xl:w-44')}>
                        <span className="hidden xl:inline">{t('Created')} </span>
                        {link.createdAt === null ? t('Unknown') : formatDate(link.createdAt)}
                    </span>
                    <span aria-hidden="true" className={cx(meta, 'xl:hidden')}>
                        ·
                    </span>
                    <span className={cx(meta, 'xl:w-20')}>{plural(link.clicks, ':count click', ':count clicks')}</span>
                </div>
                <span className={cx(meta, 'xl:w-[180px]')}>
                    {t('Last click :when', { when: link.lastClickedAt === null ? t('not yet') : timeAgo(link.lastClickedAt) })}
                </span>
            </div>
            <div className="flex shrink-0 gap-2">
                <CopyButton iconOnly text={link.url} label={t('Copy short link')} className="rounded-full bg-tint hover:bg-hover-tint" />
                <IconButton icon="trash" label={t('Delete link')} onClick={onDelete} />
            </div>
        </li>
    );
}

export default function Index({ links }: { links: LinkRow[] }) {
    const mobile = useIsMobile();
    const [pending, setPending] = useState<LinkRow | null>(null);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function ask(link: LinkRow) {
        setPending(link);
        setOpen(true);
    }

    function confirm() {
        if (pending === null) {
            return;
        }

        router.delete(`/links/${pending.code}`, {
            onStart: () => setDeleting(true),
            onFinish: () => {
                setDeleting(false);
                setOpen(false);
            },
        });
    }

    return (
        <AppLayout title={t('Links')}>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <PageHero title={t('Links')} badge={<CountPill count={links.length} />} />
                <div className={cx('w-full min-w-0 max-w-[1480px]', mobile ? 'px-4 pt-4 pb-8' : 'px-[30px] pt-6 pb-10')}>
                    <Well title={t('All links')} count={links.length} label={t('Links')}>
                        {links.length === 0 ? (
                            <p className="m-0 px-1.5 pb-1 text-[15px] text-muted">{t('No links yet.')}</p>
                        ) : (
                            <ul className="m-0 flex list-none flex-col gap-2 p-0">
                                {links.map((link) => (
                                    <Row key={link.code} link={link} onDelete={() => ask(link)} />
                                ))}
                            </ul>
                        )}
                    </Well>
                </div>
            </div>

            <Modal open={open} onClose={() => setOpen(false)} labelledBy="delete-link-title">
                <div className="flex flex-col gap-5">
                    <h2 id="delete-link-title" className="m-0 text-2xl leading-[1.3] font-extrabold text-navy">
                        {t('Delete link?')}
                    </h2>
                    <p className="m-0 text-base text-muted">
                        {t('The short link :link no longer works after this.', { link: pending?.url.replace(/^https?:\/\//, '') ?? '' })}
                    </p>
                    <div className="flex items-center gap-3">
                        <Button variant="navy" loading={deleting} onClick={confirm}>
                            {t('Delete')}
                        </Button>
                        <Button variant="subtle" onClick={() => setOpen(false)}>
                            {t('Cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
