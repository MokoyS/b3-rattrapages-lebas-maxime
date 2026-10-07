<?php

namespace App\Enum;

enum CartStatus: string
{
    case Open = 'open';
    case Validated = 'validated';
}
