<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

// Counts every attempt, also invalid ones, so failed Turnstile checks cannot be hammered either
class LimitLinkCreation
{
    private const MAX_ATTEMPTS = 10;

    private const DECAY_SECONDS = 3600;

    public function handle(Request $request, Closure $next): Response
    {
        $key = 'create-link:'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            return redirect()->route('link.create')->with('retry_after', RateLimiter::availableIn($key));
        }

        RateLimiter::hit($key, self::DECAY_SECONDS);

        return $next($request);
    }
}
