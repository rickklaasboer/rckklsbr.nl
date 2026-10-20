<?php

use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::get('/_test/origin', fn () => request()->getSchemeAndHttpHost());
});

it('trusts the forwarded scheme from any address', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9', 'HTTP_HOST' => 'rckklsbr.nl'])
        ->get('/_test/origin', ['X-Forwarded-Proto' => 'https'])
        ->assertContent('https://rckklsbr.nl');
});

it('ignores a forwarded host', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9', 'HTTP_HOST' => 'rckklsbr.nl'])
        ->get('/_test/origin', ['X-Forwarded-Proto' => 'https', 'X-Forwarded-Host' => 'evil.example'])
        ->assertContent('https://rckklsbr.nl');
});
