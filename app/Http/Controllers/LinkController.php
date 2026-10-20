<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLinkRequest;
use App\Models\Link;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class LinkController extends Controller
{
    private const CODE_ATTEMPTS = 5;

    public function create(): Response
    {
        return Inertia::render('Links/Create', [
            'turnstileSiteKey' => config()->string('services.turnstile.site_key'),
            'created' => session('created'),
            'retryAfter' => session('retry_after'),
        ]);
    }

    public function store(StoreLinkRequest $request): RedirectResponse
    {
        $link = $this->createWithUniqueCode($request->validated('destination'));

        return redirect()->route('link.create')->with('created', [
            'url' => route('link.show', $link),
            'destination' => $link->destination,
        ]);
    }

    public function show(Link $link): RedirectResponse
    {
        $link->increment('clicks', 1, ['last_clicked_at' => now()]);

        return redirect($link->destination, 302);
    }

    // The primary key decides: a check-then-insert would race with a parallel request
    private function createWithUniqueCode(string $destination): Link
    {
        for ($attempt = 0; $attempt < self::CODE_ATTEMPTS; $attempt++) {
            try {
                return Link::query()->create(['code' => Str::random(8), 'destination' => $destination]);
            } catch (UniqueConstraintViolationException) {
                continue;
            }
        }

        throw new RuntimeException('Could not find a free link code after '.self::CODE_ATTEMPTS.' attempts');
    }
}
