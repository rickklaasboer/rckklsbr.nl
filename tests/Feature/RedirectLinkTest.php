<?php

use App\Models\Link;
use Illuminate\Support\Carbon;

it('redirects an existing code with a temporary redirect', function () {
    Link::factory()->create(['code' => 'abcd1234', 'destination' => 'https://example.com/target']);

    $this->get('/abcd1234')->assertStatus(302)->assertRedirect('https://example.com/target');
});

it('counts a click and stores the time of the last one', function () {
    Carbon::setTestNow('2026-10-20 12:00:00');
    Link::factory()->create(['code' => 'abcd1234']);

    $this->get('/abcd1234');
    Carbon::setTestNow('2026-10-20 13:30:00');
    $this->get('/abcd1234');

    $link = Link::query()->findOrFail('abcd1234');

    expect($link->clicks)->toBe(2)
        ->and($link->last_clicked_at->toDateTimeString())->toBe('2026-10-20 13:30:00');
});

it('keeps a link that has never been clicked at zero', function () {
    $link = Link::factory()->create();

    expect($link->fresh()->clicks)->toBe(0)
        ->and($link->fresh()->last_clicked_at)->toBeNull();
});

it('returns 404 for an unknown code and counts nothing', function () {
    Link::factory()->create(['code' => 'abcd1234']);

    $this->get('/nope1234')->assertNotFound();

    expect(Link::query()->findOrFail('abcd1234')->clicks)->toBe(0);
});

it('does not treat other paths as a code', function () {
    $this->get('/abc')->assertNotFound();
});
