<?php

it('trusts the forwarded scheme from any address', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9', 'HTTP_HOST' => 'rckklsbr.nl'])->get('/up', [
        'X-Forwarded-Proto' => 'https',
    ]);

    expect(request()->getSchemeAndHttpHost())->toBe('https://rckklsbr.nl');
});

it('ignores a forwarded host', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9', 'HTTP_HOST' => 'rckklsbr.nl'])->get('/up', [
        'X-Forwarded-Proto' => 'https',
        'X-Forwarded-Host' => 'evil.example',
    ]);

    expect(request()->getSchemeAndHttpHost())->toBe('https://rckklsbr.nl');
});
