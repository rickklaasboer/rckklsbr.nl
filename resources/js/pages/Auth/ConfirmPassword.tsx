import { Head, useForm } from '@inertiajs/react';
import type { SyntheticEvent } from 'react';
import { t } from '../../i18n';
import { AuthShell } from '../../layouts/AuthShell';
import { Button, TextInput } from '../../ui';

export default function ConfirmPassword() {
    const form = useForm({ password: '' });

    function submit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/user/confirm-password', { onFinish: () => form.reset() });
    }

    return (
        <AuthShell title={t('Confirm password')}>
            <Head title={t('Confirm password')} />
            <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-5">
                <TextInput
                    label={t('Password')}
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    value={form.data.password}
                    error={form.errors.password}
                    onChange={(event) => form.setData('password', event.target.value)}
                />
                <div className="mt-1 flex items-center">
                    <Button type="submit" variant="primary" size="lg" loading={form.processing}>
                        {t('Confirm')}
                    </Button>
                </div>
            </form>
        </AuthShell>
    );
}
