<?php

use App\Models\Link;

it('redirects an existing code permanently', function () {
    Link::query()->create(['code' => 'abcd1234', 'destination' => 'https://example.com/target']);

    $this->get('/abcd1234')->assertStatus(301)->assertRedirect('https://example.com/target');
});

it('returns 404 for an unknown code', function () {
    $this->get('/nope1234')->assertNotFound();
});
