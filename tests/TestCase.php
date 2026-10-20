<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The container sets APP_ENV=local in $_SERVER, which beats phpunit.xml; CSRF is only skipped in "testing"
        $this->app->detectEnvironment(fn () => 'testing');
    }
}
