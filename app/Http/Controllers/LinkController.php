<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Http\Requests\StoreLinkRequest;
use App\Http\Requests\UpdateLinkRequest;
use Illuminate\Support\Str;

class LinkController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('link.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLinkRequest $request)
    {
        $link = Link::query()->create([
            'code' => Str::random(8),
            'destination' => $request->validated('destination'),
        ]);

        $link = config('app.url') . '/' . $link->code;

        return redirect()->back()
            ->with('message', sprintf('Link created successfully, your new link is <a target="_blank" href="%s">%s</a>', $link, $link));
    }

    /**
     * Display the specified resource.
     */
    public function show(Link $link)
    {
        return redirect($link->destination, 301);
    }
}
