<?php

namespace App\Models;

use Database\Factories\LinkFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    /** @use HasFactory<LinkFactory> */
    use HasFactory;

    protected $primaryKey = 'code';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['code', 'destination'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'clicks' => 'integer',
            'last_clicked_at' => 'datetime',
        ];
    }
}
