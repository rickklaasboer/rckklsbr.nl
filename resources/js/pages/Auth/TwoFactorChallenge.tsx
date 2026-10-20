import { Head, router, useForm } from '@inertiajs/react';
import { useState, type SyntheticEvent } from 'react';
import { t } from '../../i18n';
import { AuthShell } from '../../layouts/AuthShell';
import { Button, TextInput } from '../../ui';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);
    const form = useForm({ code: '', recovery_code: '' });

    function toggle() {
        setRecovery(!recovery);
        form.reset();
        form.clearErrors();
    }

    function submit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/two-factor-challenge', { onFinish: () => form.reset() });
    }

    return (
        <AuthShell title={t('Verification')}>
            <Head title={t('Verification')} />
            <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-5">
                {recovery ? (
                    <TextInput
                        key="recovery"
                        label={t('Recovery code')}
                        autoComplete="off"
                        autoFocus
                        required
                        value={form.data.recovery_code}
                        error={form.errors.recovery_code}
                        onChange={(event) => form.setData('recovery_code', event.target.value)}
                    />
                ) : (
                    <TextInput
                        key="code"
                        label={t('Authentication code')}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        required
                        value={form.data.code}
                        error={form.errors.code}
                        onChange={(event) => form.setData('code', event.target.value)}
                    />
                )}
                <div className="mt-1 flex flex-wrap items-center gap-3">
                    <Button type="submit" variant="primary" size="lg" loading={form.processing}>
                        {t('Confirm')}
                    </Button>
                    <Button type="button" variant="subtle" size="lg" onClick={toggle}>
                        {recovery ? t('Use authentication code') : t('Use recovery code')}
                    </Button>
                </div>
                <div>
                    <Button type="button" variant="subtle" size="sm" onClick={() => router.get('/login')}>
                        {t('Back to sign in')}
                    </Button>
                </div>
            </form>
        </AuthShell>
    );
}
