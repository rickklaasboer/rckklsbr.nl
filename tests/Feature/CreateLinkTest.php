<?php

use App\Models\Link;

it('shows the create form', function () {
    $this->get('/')->assertOk()->assertSee('Shorten a long link');
});

it('creates a link for a valid url', function () {
    $this->post('/', ['destination' => 'https://example.com/some/long/path?a=1'])
        ->assertRedirect()
        ->assertSessionHas('message');

    $link = Link::query()->sole();

    expect($link->code)->toHaveLength(8)
        ->and($link->destination)->toBe('https://example.com/some/long/path?a=1');
});

it('accepts http urls', function () {
    $this->post('/', ['destination' => 'http://example.com'])->assertSessionHasNoErrors();

    expect(Link::query()->count())->toBe(1);
});

it('rejects a missing destination', function () {
    $this->post('/', [])->assertSessionHasErrors('destination');

    expect(Link::query()->count())->toBe(0);
});

it('rejects text that is not a url', function () {
    $this->post('/', ['destination' => 'not a url'])->assertSessionHasErrors('destination');

    expect(Link::query()->count())->toBe(0);
});

it('rejects non-http schemes', function (string $destination) {
    $this->post('/', ['destination' => $destination])->assertSessionHasErrors('destination');

    expect(Link::query()->count())->toBe(0);
})->with([
    'javascript' => 'javascript:alert(1)',
    'ftp' => 'ftp://example.com/file',
    'file' => 'file:///etc/passwd',
    'data' => 'data:text/html,<script>alert(1)</script>',
]);
