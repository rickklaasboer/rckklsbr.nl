<?php

use App\Models\Link;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => fakeTurnstile());

function createLink(string $destination = 'https://example.com/some/long/path?a=1', string $token = 'token'): TestResponse
{
    return test()->post('/', ['destination' => $destination, 'turnstile' => $token]);
}

it('shows the create page with the site key', function () {
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Links/Create')
        ->where('turnstileSiteKey', 'test-site-key')
        ->where('created', null)
        ->where('retryAfter', null));
});

it('creates a link for a valid url and shows the short link', function () {
    createLink()->assertRedirect(route('link.create'));

    $link = Link::query()->sole();

    expect($link->code)->toHaveLength(8)
        ->and($link->destination)->toBe('https://example.com/some/long/path?a=1')
        ->and($link->clicks)->toBe(0)
        ->and($link->last_clicked_at)->toBeNull();

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('created.url', route('link.show', $link))
        ->where('created.destination', 'https://example.com/some/long/path?a=1'));
});

it('does not show the created link on the next visit', function () {
    createLink();

    $this->get('/');

    $this->get('/')->assertInertia(fn (Assert $page) => $page->where('created', null));
});

it('accepts http urls', function () {
    createLink('http://example.com')->assertSessionHasNoErrors();

    expect(Link::query()->count())->toBe(1);
});

it('rejects a missing destination', function () {
    $this->post('/', ['turnstile' => 'token'])->assertSessionHasErrors('destination');

    expect(Link::query()->count())->toBe(0);
});

it('rejects text that is not a url', function () {
    createLink('not a url')->assertSessionHasErrors('destination');

    expect(Link::query()->count())->toBe(0);
});

it('rejects non-http schemes', function (string $destination) {
    createLink($destination)->assertSessionHasErrors('destination');

    expect(Link::query()->count())->toBe(0);
})->with([
    'javascript' => 'javascript:alert(1)',
    'ftp' => 'ftp://example.com/file',
    'file' => 'file:///etc/passwd',
    'data' => 'data:text/html,<script>alert(1)</script>',
]);

it('retries with a new code when the first one is taken', function () {
    Link::factory()->create(['code' => 'aaaaaaaa']);
    // Only link codes are scripted; the session and token strings use the other lengths
    $codes = ['aaaaaaaa', 'bbbbbbbb'];
    Str::createRandomStringsUsing(function (int $length) use (&$codes) {
        return $length === 8 ? array_shift($codes) : str_repeat('x', $length);
    });

    createLink()->assertRedirect(route('link.create'));

    expect(Link::query()->pluck('code')->all())->toEqualCanonicalizing(['aaaaaaaa', 'bbbbbbbb']);

    Str::createRandomStringsNormally();
});

it('fails loudly when no free code is found', function () {
    Link::factory()->create(['code' => 'aaaaaaaa']);
    Str::createRandomStringsUsing(fn () => 'aaaaaaaa');

    $this->withoutExceptionHandling();

    expect(fn () => createLink())->toThrow(RuntimeException::class);

    Str::createRandomStringsNormally();
});

it('verifies the turnstile token with the secret and client ip', function () {
    createLink(token: 'abc123');

    Http::assertSent(fn (Request $request) => $request->url() === 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
        && $request['secret'] === 'test-secret-key'
        && $request['response'] === 'abc123'
        && $request['remoteip'] === '127.0.0.1');
});

it('rejects a failed turnstile check', function () {
    fakeTurnstile(['success' => false, 'error-codes' => ['invalid-input-response']]);
    Log::spy();

    createLink()->assertSessionHasErrors('turnstile');

    expect(Link::query()->count())->toBe(0);
    Log::shouldHaveReceived('warning')->once();
});

it('rejects a missing turnstile token without calling siteverify', function () {
    $this->post('/', ['destination' => 'https://example.com'])->assertSessionHasErrors('turnstile');

    expect(Link::query()->count())->toBe(0)
        ->and(turnstileCallCount())->toBe(0);
});

it('logs and rejects when siteverify answers with an error', function () {
    fakeTurnstile(['success' => false], 500);
    Log::spy();

    createLink()->assertSessionHasErrors('turnstile');

    expect(Link::query()->count())->toBe(0);
    Log::shouldHaveReceived('error')->once();
});

it('logs and rejects when siteverify is unreachable', function () {
    Http::fake(fn () => throw new ConnectionException('timeout'));
    Log::spy();

    createLink()->assertSessionHasErrors('turnstile');

    expect(Link::query()->count())->toBe(0);
    Log::shouldHaveReceived('error')->once();
});

it('fails loudly when the turnstile secret is not configured', function () {
    config(['services.turnstile.secret_key' => null]);
    $this->withoutExceptionHandling();

    expect(fn () => createLink())->toThrow(InvalidArgumentException::class);
});

it('limits link creation per ip and reports the retry time', function () {
    for ($attempt = 0; $attempt < 10; $attempt++) {
        createLink()->assertRedirect(route('link.create'));
    }

    createLink('https://example.com/eleventh')->assertRedirect(route('link.create'));

    expect(Link::query()->count())->toBe(10)
        ->and(turnstileCallCount())->toBe(10);

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('created', null)
        ->where('retryAfter', fn ($seconds) => $seconds > 0 && $seconds <= 3600));
});
