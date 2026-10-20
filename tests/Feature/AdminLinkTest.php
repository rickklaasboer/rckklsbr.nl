<?php

use App\Models\Link;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('requires login for the overview', function () {
    $this->get('/links')->assertRedirect(route('login'));
});

it('requires login to delete a link', function () {
    Link::factory()->create(['code' => 'abcd1234']);

    $this->delete('/links/abcd1234')->assertRedirect(route('login'));

    expect(Link::query()->count())->toBe(1);
});

it('lists the links newest first with their click data', function () {
    Link::factory()->create(['code' => 'old00001', 'created_at' => '2026-10-01 10:00:00']);
    Link::factory()->create([
        'code' => 'new00001',
        'destination' => 'https://example.com/new',
        'created_at' => '2026-10-02 10:00:00',
    ]);
    Link::query()->whereKey('new00001')->update(['clicks' => 128, 'last_clicked_at' => '2026-10-20 09:14:00']);

    $this->actingAs(User::factory()->create())
        ->get('/links')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Links/Index')
            ->has('links', 2)
            ->where('links.0.code', 'new00001')
            ->where('links.0.url', route('link.show', 'new00001'))
            ->where('links.0.destination', 'https://example.com/new')
            ->where('links.0.clicks', 128)
            ->where('links.0.lastClickedAt', '2026-10-20T09:14:00+00:00')
            ->where('links.1.code', 'old00001')
            ->where('links.1.lastClickedAt', null));
});

it('deletes a link for good', function () {
    Link::factory()->create(['code' => 'abcd1234']);
    Link::factory()->create(['code' => 'keep0001']);

    $this->actingAs(User::factory()->create())
        ->delete('/links/abcd1234')
        ->assertRedirect(route('links.index'))
        ->assertSessionHas('success');

    expect(Link::query()->pluck('code')->all())->toBe(['keep0001']);
    $this->get('/abcd1234')->assertNotFound();
});

it('returns 404 when deleting an unknown link', function () {
    $this->actingAs(User::factory()->create())->delete('/links/nope1234')->assertNotFound();
});
