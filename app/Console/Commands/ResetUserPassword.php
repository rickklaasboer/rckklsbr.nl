<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class ResetUserPassword extends Command
{
    protected $signature = 'user:reset-password {--email=} {--password=} {--disable-2fa}';

    protected $description = 'Reset the app user password, optionally disabling two factor';

    public function handle(): int
    {
        $email = $this->option('email') ?? text(__('Email address'), required: true);
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error(__('No user found with this email address.'));

            return self::FAILURE;
        }

        $newPassword = $this->option('password') ?? password(__('New password'), required: true);

        $validator = Validator::make(
            ['password' => $newPassword],
            ['password' => ['required', Password::min(12)]],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $user->password = $newPassword;
        $user->setRememberToken(Str::random(60));

        if ($this->option('disable-2fa')) {
            $user->forceFill([
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ]);
        }

        $user->save();
        $this->info(__('Password changed.'));

        return self::SUCCESS;
    }
}
