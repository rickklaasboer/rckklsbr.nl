<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class CreateUser extends Command
{
    protected $signature = 'user:create {--email=} {--name=} {--password=}';

    protected $description = 'Create the app user';

    public function handle(): int
    {
        // Single-user app: the admin is the only account
        if (User::query()->exists()) {
            $this->error(__('A user already exists.'));

            return self::FAILURE;
        }

        $data = [
            'name' => $this->option('name') ?? text(__('Name'), required: true),
            'email' => $this->option('email') ?? text(__('Email address'), required: true),
            'password' => $this->option('password') ?? password(__('Password'), required: true),
        ];

        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', Password::min(12)],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        User::create($data);
        $this->info(__('User created.'));

        return self::SUCCESS;
    }
}
