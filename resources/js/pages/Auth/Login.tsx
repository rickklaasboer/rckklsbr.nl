import { Head, useForm } from '@inertiajs/react';
import type { SyntheticEvent } from 'react';
import { t } from '../../i18n';
import { AuthShell } from '../../layouts/AuthShell';
import { Button, Checkbox, TextInput } from '../../ui';

export default function Login() {
    const form = useForm({ email: '', password: '', remember: false });

    function submit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    }

    return (
        <AuthShell title={t('Sign in')}>
            <Head title={t('Sign in')} />
            <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-5">
                <TextInput
                    label={t('Email address')}
                    type="email"
                    autoComplete="username"
                    autoFocus
                    required
                    value={form.data.email}
                    error={form.errors.email}
                    onChange={(event) => form.setData('email', event.target.value)}
                />
                <TextInput
                    label={t('Password')}
                    type="password"
                    autoComplete="current-password"
                    required
                    value={form.data.password}
                    error={form.errors.password}
                    onChange={(event) => form.setData('password', event.target.value)}
                />
                <Checkbox
                    label={t('Keep me signed in')}
                    checked={form.data.remember}
                    onChange={(remember) => form.setData('remember', remember)}
                />
                <div className="mt-1 flex items-center">
                    <Button type="submit" variant="primary" size="lg" loading={form.processing}>
                        {t('Sign in')}
                    </Button>
                </div>
            </form>
        </AuthShell>
    );
}
