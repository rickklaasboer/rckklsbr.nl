<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Tokens are single use: the frontend resets the widget after every attempt
class Turnstile implements ValidationRule
{
    private const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $ip = request()->ip();

        try {
            $result = Http::asForm()
                ->timeout(10)
                ->post(self::SITEVERIFY_URL, [
                    'secret' => config()->string('services.turnstile.secret_key'),
                    'response' => $value,
                    'remoteip' => $ip,
                ])
                ->throw()
                ->json();
        } catch (ConnectionException|RequestException $exception) {
            Log::error('turnstile siteverify failed', ['ip' => $ip, 'message' => $exception->getMessage()]);
            $fail('Verification failed.')->translate();

            return;
        }

        if (($result['success'] ?? false) !== true) {
            Log::warning('turnstile rejected', ['ip' => $ip, 'errors' => $result['error-codes'] ?? []]);
            $fail('Verification failed.')->translate();
        }
    }
}
