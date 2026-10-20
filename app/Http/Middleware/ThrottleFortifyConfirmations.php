<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Symfony\Component\HttpFoundation\Response;

// Fortify registers these routes without a limiter and has no option for one.
// Set via config('fortify.middleware') so it survives route:cache.
class ThrottleFortifyConfirmations
{
    private const ROUTES = ['password.confirm.store', 'two-factor.confirm'];

    public function handle(Request $request, Closure $next): Response
    {
        if (! in_array($request->route()?->getName(), self::ROUTES, true)) {
            return $next($request);
        }

        return app(ThrottleRequests::class)->handle($request, $next, 6, 1);
    }
}
