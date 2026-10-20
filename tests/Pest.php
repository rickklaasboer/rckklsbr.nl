<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/**
 * @param  array<string, mixed>  $body
 */
function fakeTurnstile(array $body = ['success' => true], int $status = 200): void
{
    // A fresh factory: the first registered stub wins, so a second fake() would not override the first
    Http::swap(new Factory);
    Http::fake([
        'challenges.cloudflare.com/*' => Http::response($body, $status),
    ]);
}

function turnstileCallCount(): int
{
    return Http::recorded(fn (Request $request) => str_contains($request->url(), 'siteverify'))->count();
}
