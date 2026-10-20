<?php

namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminLinkController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Links/Index', [
            'links' => Link::query()->latest()->get()->map(fn (Link $link) => [
                'code' => $link->code,
                'url' => route('link.show', $link),
                'destination' => $link->destination,
                'createdAt' => $link->created_at?->toIso8601String(),
                'clicks' => $link->clicks,
                'lastClickedAt' => $link->last_clicked_at?->toIso8601String(),
            ]),
        ]);
    }

    public function destroy(Link $link): RedirectResponse
    {
        $link->delete();

        return redirect()->route('links.index')->with('success', __('Link deleted.'));
    }
}
