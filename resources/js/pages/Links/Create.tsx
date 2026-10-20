import { Link, useForm } from '@inertiajs/react';
import { useState, type SyntheticEvent } from 'react';
import { Turnstile } from '../../components/Turnstile';
import { t } from '../../i18n';
import { PublicLayout } from '../../layouts/PublicLayout';
import { plural } from '../../lib/plural';
import type { CreatedLink } from '../../types';
import { Alert, Button, buttonClass, CopyButton, TextInput } from '../../ui';

const card = 'flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:col-span-8 md:gap-6 md:p-10';

type Props = { turnstileSiteKey: string; created: CreatedLink | null; retryAfter: number | null };

export default function Create({ turnstileSiteKey, created, retryAfter }: Props) {
    const form = useForm({ destination: '', turnstile: '' });
    const [turnstileReset, setTurnstileReset] = useState(0);

    function submit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/', {
            onSuccess: () => form.reset('destination'),
            onFinish: () => {
                form.setData('turnstile', '');
                setTurnstileReset((count) => count + 1);
            },
        });
    }

    return (
        <PublicLayout title={t('New link')}>
            <div className="mx-auto flex max-w-[1248px] flex-col gap-3.5 px-6 pt-6 pb-12 md:grid md:grid-cols-12 md:items-start md:gap-6 md:pt-14 md:pb-24">
                {created ? (
                    <div className={card}>
                        <Alert tone="success" role="status" title={t('Your short link is ready.')} />
                        <TextInput
                            label={t('Your short link')}
                            readOnly
                            value={created.url.replace(/^https?:\/\//, '')}
                            trailing={<CopyButton iconOnly text={created.url} label={t('Copy the short link')} className="rounded-lg bg-transparent opacity-60 hover:bg-tint hover:opacity-100" />}
                        />
                        <div className="-mt-3 truncate text-sm text-muted md:-mt-5">{t('To :destination', { destination: created.destination })}</div>
                        <div>
                            <Link href="/" className={`${buttonClass('primary', 'lg')} w-full md:w-auto`}>
                                {t('Shorten another link')}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={submit} noValidate className={card}>
                        <TextInput
                            label={t('Link')}
                            name="destination"
                            autoComplete="off"
                            placeholder="https://voorbeeld.nl/een/heel/lang/pad"
                            value={form.data.destination}
                            onChange={(event) => form.setData('destination', event.target.value)}
                        />
                        <Turnstile siteKey={turnstileSiteKey} resetKey={turnstileReset} onToken={(token) => form.setData('turnstile', token)} />
                        <div>
                            <Button type="submit" variant="primary" size="lg" loading={form.processing} className="w-full md:w-auto">
                                {t('Shorten')}
                            </Button>
                        </div>
                        {form.errors.destination && (
                            <Alert tone="error" title={t('This is not a valid link.')}>
                                {t('Start with http:// or https://.')}
                            </Alert>
                        )}
                        {form.errors.turnstile && (
                            <Alert tone="error" title={t('Check failed.')}>
                                {t('I could not verify that you are human. Try again.')}
                            </Alert>
                        )}
                        {retryAfter !== null && (
                            <Alert tone="warning" title={t('Take it easy.')}>
                                {t('You have created a lot of links in a short time. Try again in :time.', {
                                    time: plural(retryAfter, ':count second', ':count seconds'),
                                })}
                            </Alert>
                        )}
                    </form>
                )}
                <aside className="on-dark rounded-3xl bg-navy p-6 text-sky md:col-span-4 md:p-8">
                    <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.02em] text-white md:text-[26px]">{t('How it works')}</h2>
                    <p className="m-0 mt-4 text-base">{t('Open the short link and I send you on to the original address. I count how often the link is opened.')}</p>
                </aside>
            </div>
        </PublicLayout>
    );
}
