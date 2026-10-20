<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the login page', function () {
    $this->get('/login')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
});

it('logs in with the right credentials and lands on the overview', function () {
    $user = User::factory()->create(['email' => 'rick@example.com']);

    $this->post('/login', ['email' => 'rick@example.com', 'password' => 'password'])
        ->assertRedirect('/links');

    $this->assertAuthenticatedAs($user);
});

it('rejects a wrong password', function () {
    User::factory()->create(['email' => 'rick@example.com']);

    $this->post('/login', ['email' => 'rick@example.com', 'password' => 'wrong'])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('logs out', function () {
    $this->actingAs(User::factory()->create())->post('/logout');

    $this->assertGuest();
});

it('creates the single user from the command', function () {
    $this->artisan('user:create', ['--name' => 'Rick', '--email' => 'rick@example.com', '--password' => 'a-long-enough-pass'])
        ->assertSuccessful();

    expect(User::query()->sole()->email)->toBe('rick@example.com');

    $this->artisan('user:create', ['--name' => 'Other', '--email' => 'other@example.com', '--password' => 'a-long-enough-pass'])
        ->assertFailed();

    expect(User::query()->count())->toBe(1);
});

it('rejects a short password in the command', function () {
    $this->artisan('user:create', ['--name' => 'Rick', '--email' => 'rick@example.com', '--password' => 'short'])
        ->assertFailed();

    expect(User::query()->count())->toBe(0);
});
