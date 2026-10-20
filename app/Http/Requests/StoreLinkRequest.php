<?php

namespace App\Http\Requests;

use App\Rules\Turnstile;
use Illuminate\Foundation\Http\FormRequest;

class StoreLinkRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'destination' => ['required', 'string', 'max:2048', 'url:http,https'],
            'turnstile' => ['bail', 'required', 'string', new Turnstile],
        ];
    }
}
