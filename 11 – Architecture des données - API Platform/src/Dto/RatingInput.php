<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class RatingInput
{
    #[Assert\NotNull]
    #[Assert\Range(min: 1, max: 5)]
    public ?int $score = null;
}
