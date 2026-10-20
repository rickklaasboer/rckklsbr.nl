import { router } from '@inertiajs/react';
import { useEffect, useState, type SyntheticEvent } from 'react';
import { t } from '../../i18n';
import { SettingsLayout } from '../../layouts/SettingsLayout';
import { http, HttpError } from '../../lib/http';
import { Alert, Button, CopyButton, Eyebrow, Modal, TextInput, useToast, Well, WELL_ROW } from '../../ui';

type Props = { twoFactorEnabled: boolean; twoFactorConfirmed: boolean };
type Setup = { svg: string; secretKey: string };

const PASSWORD_CONFIRMATION_REQUIRED = 423;

export default function Security({ twoFactorEnabled, twoFactorConfirmed }: Props) {
    const toast = useToast();
    const [setup, setSetup] = useState<Setup | null>(null);
    const [codes, setCodes] = useState<string[] | null>(null);
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState<string>();
    const [busy, setBusy] = useState(false);
    const [pending, setPending] = useState<(() => Promise<void>) | null>(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string>();
    const [confirmingDisable, setConfirmingDisable] = useState(false);
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [nextConfirmation, setNextConfirmation] = useState('');
    const [changeErrors, setChangeErrors] = useState<Record<string, string[]>>({});
    const [changing, setChanging] = useState(false);

    function refresh() {
        router.reload({ only: ['twoFactorEnabled', 'twoFactorConfirmed'] });
    }

    function fail(error: unknown) {
        if (error instanceof HttpError) {
            toast.show({ kind: 'error', title: t('Something went wrong'), body: error.message });
            return;
        }
        throw error;
    }

    // Fortify answers 423 when the password was not confirmed recently: ask for it, then retry
    async function guarded(action: () => Promise<void>) {
        setBusy(true);
        try {
            await action();
        } catch (error) {
            if (error instanceof HttpError && error.status === PASSWORD_CONFIRMATION_REQUIRED) {
                setPending(() => action);
            } else {
                fail(error);
            }
        } finally {
            setBusy(false);
        }
    }

    async function loadSetup() {
        const [qr, key] = await Promise.all([
            http<{ svg: string }>('GET', '/user/two-factor-qr-code'),
            http<{ secretKey: string }>('GET', '/user/two-factor-secret-key'),
        ]);
        setSetup({ svg: qr.svg, secretKey: key.secretKey });
    }

    async function loadCodes() {
        setCodes(await http<string[]>('GET', '/user/two-factor-recovery-codes'));
    }

    useEffect(() => {
        if (twoFactorEnabled && !twoFactorConfirmed && !setup) {
            guarded(loadSetup);
        }
    }, [twoFactorEnabled, twoFactorConfirmed]);

    const enable = () =>
        guarded(async () => {
            await http('POST', '/user/two-factor-authentication');
            await loadSetup();
            refresh();
        });

    const disable = () =>
        guarded(async () => {
            await http('DELETE', '/user/two-factor-authentication');
            setSetup(null);
            setCodes(null);
            setCode('');
            refresh();
        });

    async function confirmDisable() {
        await disable();
        setConfirmingDisable(false);
    }

    const regenerate = () =>
        guarded(async () => {
            await http('POST', '/user/two-factor-recovery-codes');
            await loadCodes();
        });

    async function submitCode() {
        setCodeError(undefined);
        try {
            await http('POST', '/user/confirmed-two-factor-authentication', { code });
        } catch (error) {
            if (error instanceof HttpError && error.status === 422) {
                setCodeError(error.errors.code?.[0] ?? error.message);
                toast.show({ kind: 'error', title: t('Code rejected'), body: error.message });
                return;
            }
            throw error;
        }

        setSetup(null);
        setCode('');
        await loadCodes();
        refresh();
    }

    function confirm(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        guarded(submitCode);
    }

    async function confirmPassword(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        const retry = pending;
        if (!retry) {
            throw new Error('Password confirmation without a pending action');
        }

        setPasswordError(undefined);
        setBusy(true);
        try {
            await http('POST', '/user/confirm-password', { password });
        } catch (error) {
            setBusy(false);
            if (error instanceof HttpError && error.status === 422) {
                setPasswordError(error.errors.password?.[0] ?? error.message);
                return;
            }
            fail(error);
            return;
        }

        setPending(null);
        setPassword('');
        setBusy(false);
        await guarded(retry);
    }

    async function changePassword(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setChangeErrors({});
        setChanging(true);
        try {
            await http('PUT', '/user/password', {
                current_password: current,
                password: next,
                password_confirmation: nextConfirmation,
            });
        } catch (error) {
            if (error instanceof HttpError && error.status === 422) {
                setChangeErrors(error.errors);
                return;
            }
            fail(error);
            return;
        } finally {
            setChanging(false);
        }

        setCurrent('');
        setNext('');
        setNextConfirmation('');
        toast.show({ kind: 'success', title: t('Password changed.') });
    }

    function closePasswordModal() {
        setPending(null);
        setPassword('');
        setPasswordError(undefined);
    }

    return (
        <SettingsLayout title={t('Security')}>
            <div className="flex flex-wrap items-start gap-x-16 gap-y-10">
                <section className="flex max-w-[520px] min-w-0 flex-[1_1_380px] flex-col gap-5">
                    <Eyebrow>{t('Change password')}</Eyebrow>

                    <form onSubmit={changePassword} className="flex flex-col gap-5">
                        <TextInput
                            label={t('Current password')}
                            type="password"
                            autoComplete="current-password"
                            required
                            value={current}
                            error={changeErrors.current_password?.[0]}
                            onChange={(event) => setCurrent(event.target.value)}
                        />
                        <TextInput
                            label={t('New password')}
                            type="password"
                            autoComplete="new-password"
                            required
                            value={next}
                            error={changeErrors.password?.[0]}
                            onChange={(event) => setNext(event.target.value)}
                        />
                        <TextInput
                            label={t('Confirm new password')}
                            type="password"
                            autoComplete="new-password"
                            required
                            value={nextConfirmation}
                            onChange={(event) => setNextConfirmation(event.target.value)}
                        />
                        <div>
                            <Button type="submit" variant="outline" size="lg" loading={changing}>
                                {t('Change password')}
                            </Button>
                        </div>
                    </form>
                </section>

                <section className="flex max-w-[520px] min-w-0 flex-[1_1_380px] flex-col gap-5">
                    <Eyebrow>{t('Two-factor authentication')}</Eyebrow>

                    {!twoFactorEnabled && (
                        <div>
                            <Button variant="primary" size="lg" loading={busy} onClick={enable}>
                                {t('Enable two-factor authentication')}
                            </Button>
                        </div>
                    )}

                    {twoFactorEnabled && !twoFactorConfirmed && (
                        <form onSubmit={confirm} className="flex flex-col gap-5">
                            {setup && (
                                <>
                                    <div
                                        className="size-[200px] [&>svg]:size-full"
                                        role="img"
                                        aria-label={t('QR code')}
                                        dangerouslySetInnerHTML={{ __html: setup.svg }}
                                    />
                                    <div>
                                        <div className="mb-1.5 text-sm font-bold text-navy">{t('Setup key')}</div>
                                        <code className="font-mono text-[15px] break-all text-ink">{setup.secretKey}</code>
                                    </div>
                                </>
                            )}
                            <TextInput
                                label={t('Authentication code')}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                required
                                value={code}
                                error={codeError}
                                onChange={(event) => setCode(event.target.value)}
                            />
                            <div className="flex items-center gap-3">
                                <Button type="submit" variant="primary" size="lg" loading={busy}>
                                    {t('Confirm')}
                                </Button>
                                <Button type="button" variant="subtle" size="lg" disabled={busy} onClick={disable}>
                                    {t('Cancel')}
                                </Button>
                            </div>
                        </form>
                    )}

                    {twoFactorEnabled && twoFactorConfirmed && (
                        <>
                            <Alert tone="success" title={t('Two-factor authentication is on.')} role="status" />

                            {codes ? (
                                <div className="flex flex-col gap-4">
                                    <Well>
                                        <ul className="m-0 flex list-none flex-col gap-2 p-0 font-mono text-[15px] text-ink">
                                            {codes.map((recovery) => (
                                                <li key={recovery} className={WELL_ROW}>
                                                    {recovery}
                                                </li>
                                            ))}
                                        </ul>
                                    </Well>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <CopyButton text={codes.join('\n')} label={t('Copy codes')} />
                                        <Button variant="default" size="sm" loading={busy} onClick={regenerate}>
                                            {t('Regenerate codes')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Button variant="default" size="md" loading={busy} onClick={() => guarded(loadCodes)}>
                                        {t('Show recovery codes')}
                                    </Button>
                                </div>
                            )}

                            <div>
                                <Button variant="outline" size="md" disabled={busy} onClick={() => setConfirmingDisable(true)}>
                                    {t('Disable two-factor authentication')}
                                </Button>
                            </div>
                        </>
                    )}
                </section>
            </div>

            <Modal open={confirmingDisable} onClose={() => setConfirmingDisable(false)} labelledBy="disable-2fa-title">
                <div className="flex flex-col gap-5">
                    <h2 id="disable-2fa-title" className="m-0 text-2xl font-extrabold text-navy">
                        {t('Disable two-factor authentication?')}
                    </h2>
                    <div className="flex items-center gap-3">
                        <Button variant="navy" size="md" loading={busy} onClick={confirmDisable}>
                            {t('Disable')}
                        </Button>
                        <Button variant="subtle" size="md" disabled={busy} onClick={() => setConfirmingDisable(false)}>
                            {t('Cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal open={pending !== null} onClose={closePasswordModal} labelledBy="confirm-password-title">
                <form onSubmit={confirmPassword} className="flex flex-col gap-5">
                    <h2 id="confirm-password-title" className="m-0 text-2xl font-extrabold text-navy">
                        {t('Confirm password')}
                    </h2>
                    <TextInput
                        label={t('Password')}
                        type="password"
                        autoComplete="current-password"
                        autoFocus
                        required
                        value={password}
                        error={passwordError}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <div className="flex items-center gap-3">
                        <Button type="submit" variant="primary" size="md" loading={busy}>
                            {t('Confirm')}
                        </Button>
                        <Button type="button" variant="subtle" size="md" onClick={closePasswordModal}>
                            {t('Cancel')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </SettingsLayout>
    );
}
